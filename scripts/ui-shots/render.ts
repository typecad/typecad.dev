// ---------------------------------------------------------------------------
// render.ts — generate the UI docs images from small .ui snippets.
//
// Runs the typecad-hal preview pipeline headlessly: buildPreviewSnapshot
// (same parser / cascade / Yoga layout / font bake as the firmware build) →
// PreviewUIRuntime → framebuffer → PNG via sharp. No browser, no board.
//
//   HAL_DIR=../hal npx --prefix ../hal tsx scripts/ui-shots/render.ts [filter]
//
// HAL_DIR defaults to ../hal (a sibling checkout of github.com/typecad/hal).
// Images land in static/hal/ui/<name>.png at 2× nearest-neighbor.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SHOTS, PANELS, type Shot } from './shots.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '../..');
const halDir = path.resolve(process.env.HAL_DIR ?? path.join(siteRoot, '../hal'));
const outDir = path.join(siteRoot, 'static/hal/ui');
const snippetDir = path.join(here, 'snippets');

const uiSrc = path.join(halDir, 'packages/ui/src/preview');
const { buildPreviewSnapshot } = await import(pathToFileURL(path.join(uiSrc, 'build-program.ts')).href);
const { PreviewUIRuntime } = await import(pathToFileURL(path.join(uiSrc, 'host-ui-runtime.ts')).href);
// sharp ships with @typecad/ui (it decodes <img> sources) — resolve it from there.
const halRequire = createRequire(path.join(halDir, 'packages/ui/package.json'));
const sharp = halRequire('sharp');

const filter = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });

// Snippets @import "@typecad/ui/themes/…" like a real project would. Give the
// snippet folder a node_modules link to the hal checkout's package so those
// bare specifiers resolve (gitignored; recreated on every run).
const linkDir = path.join(snippetDir, 'node_modules/@typecad');
const linkPath = path.join(linkDir, 'ui');
fs.mkdirSync(linkDir, { recursive: true });
fs.rmSync(linkPath, { recursive: true, force: true });
fs.symlinkSync(path.join(halDir, 'packages/ui'), linkPath, 'junction');

function centreOf(snapshot: any, id: string): [number, number] {
	const node = snapshot.program.nodes.find((n: any) => n.id === id);
	if (!node) throw new Error(`no element with id "${id}"`);
	return [node.box.x + node.box.w / 2, node.box.y + node.box.h / 2];
}

async function render(shot: Shot, panelKey: string): Promise<string> {
	const panel = PANELS[panelKey];
	const entry = path.join(snippetDir, shot.file);
	const config = {
		configPath: path.join(snippetDir, 'typecad-hal.config.ts'),
		entry: './' + shot.file,
		display: {
			...panel.display,
			width: shot.width ?? panel.display.width,
			height: shot.height ?? panel.display.height,
			...(shot.themeClass ? { themeClass: shot.themeClass } : {})
		}
	};
	const snapshot = await buildPreviewSnapshot({ config, projectRoot: snippetDir });
	for (const d of snapshot.diagnostics ?? []) {
		if (d.severity !== 'info') console.warn(`  [${shot.name}/${panelKey}] ${d.severity}: ${d.message}`);
	}

	const rt = new PreviewUIRuntime(snapshot);
	rt.start();
	try {
		for (let i = 0; i < 4; i++) rt.tick(16);
		for (const step of shot.steps ?? []) {
			const at = step.tapId ? centreOf(snapshot, step.tapId) : step.tap;
			if (at) {
				rt.pointerDown(at[0], at[1]);
				rt.tick(step.holdMs ?? 40);
				if (!step.keepDown) rt.pointerUp();
			}
			if (step.drag) {
				const [x0, y0, x1, y1] = step.drag;
				rt.pointerDown(x0, y0);
				for (let k = 1; k <= 8; k++) {
					rt.pointerMove(x0 + ((x1 - x0) * k) / 8, y0 + ((y1 - y0) * k) / 8);
					rt.tick(16);
				}
				rt.pointerUp();
			}
			// Touch debounce, slide/settle animations and the keyboard read the
			// wall clock (Date.now), so really wait — then tick to catch up.
			const waitMs = step.waitMs ?? 60;
			const end = Date.now() + waitMs;
			while (Date.now() < end) {
				await new Promise((r) => setTimeout(r, 16));
				rt.tick(16);
			}
		}
		const { width, height } = rt.gfx;
		const rgba = Buffer.from(rt.gfx.toRgbaBytes());
		const scale = shot.scale ?? panel.scale;
		const name = panelKey === 'tft' ? shot.name : `${shot.name}-${panelKey}`;
		const out = path.join(outDir, `${name}.png`);
		await sharp(rgba, { raw: { width, height, channels: 4 } })
			.resize(width * scale, height * scale, { kernel: 'nearest' })
			.png({ compressionLevel: 9, palette: true })
			.toFile(out);
		return out;
	} finally {
		rt.stop();
	}
}

let count = 0;
for (const shot of SHOTS) {
	if (filter && !shot.name.includes(filter)) continue;
	for (const panelKey of shot.panels ?? ['tft']) {
		try {
			const out = await render(shot, panelKey);
			count++;
			console.log(`✓ ${path.relative(siteRoot, out)}`);
		} catch (err) {
			console.error(`✗ ${shot.name}/${panelKey}: ${(err as Error).message}`);
			process.exitCode = 1;
		}
	}
}
console.log(`${count} image(s) written to ${path.relative(siteRoot, outDir)}`);
