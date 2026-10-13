<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const basicExample = `import { PCB, Image } from '@typecad/pcb';

let pcb = new PCB('badge');

let art = new Image({
  file: 'logo.png',        // PNG or SVG
  at: [50, 30],            // artwork center, mm
  size: 40,                // mm width; height follows the aspect
});

pcb.create(art);`;

	const realLogo = `let art = new Image({
  file: './assets/favicon.png',
  at: [142.5, 85.5],
  size: [12, 12],          // bounding box, aspect preserved
  inks: { copper: '#02B388' },   // the logo's actual color
});`;

	const svgExample = `let art = new Image({
  file: 'logo.svg',        // vector end to end — no rasterizing
  at: { x: 20, y: 20 },
  size: 15,
});`;

	const stackExample = `let art = new Image({
  file: 'logo.png',
  at: [50, 30],
  size: 30,
  inks: {
    custom: [
      { color: '#000000', stack: { copper: true } },       // hidden copper
      { color: '#800080', stack: { maskPaint: true } },    // paint mask back
    ],
  },
});`;

	const packageExample = `export class Badge extends Package {
  art: Image;
  build(): void {
    // package-local coordinates, like every component placement
    this.art = new Image({ file: 'logo.png', at: [2, 2], size: 4 });
  }
}

// the package pattern delivers it:
typecad.create(badge.components);`;

	const options = [
		['file', 'Path to a PNG or SVG file, relative to the project root'],
		['at', "Artwork center in mm — [x, y] or { x, y }"],
		[
			'size',
			'mm width (height follows the aspect), or [w, h] for a bounding box the art fits inside, aspect preserved. Default: one pixel or SVG unit per resolution'
		],
		["side", "'front' or 'back' — back mirrors the artwork and uses B.* layers"],
		['resolution', 'mm per raster cell for PNG input. Default 0.1'],
		["mode", "'contours' (default) traces boundaries into a few polygons; 'rects' emits merged rectangles"],
		['smooth', 'Contour simplification, max deviation in mm. Default half the resolution; 0 keeps every vertex'],
		['inks', 'Per-ink color overrides — see the table below'],
		['maskExpansion', 'How far the mask opening grows past copper, mm. Default 0.05'],
		['tolerance', 'How far off-palette a pixel may drift and still match (RGB distance 0–441). Default 100'],
		['inks.custom', 'Additional color-keyed inks, each mapped to a layer stack — see below'],
		['allowExposedSilk', 'Permit a custom ink stacking silk over a mask opening. Most fabs strip that silkscreen — set this only for a fab that will print it'],
		['locked', 'Lock the generated graphics against editing in KiCAD']
	];

	const inkRows = [
		['red #FF0000', 'copper', 'F.Cu, plus an F.Mask opening so it shows (copper under intact mask is invisible)'],
		['white #FFFFFF', 'silkscreen', 'F.SilkS'],
		['blue #0000FF', 'mask opening', 'F.Mask — bare substrate, or gold where copper sits under it']
	];
</script>

<svelte:head>
	<title>Artwork — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Put a PNG or SVG on the board as exposed copper, silkscreen, and solder-mask openings with the Image class."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Artwork</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Logos, glyphs, board art. <code>Image</code> places a PNG or SVG on the board using the three
	inks a fabbed board actually has, and the result is ordinary board graphics — the gerber
	exporter, the viewer, and the rule checks treat it like anything else on the copper.
</p>

<ApiCard
	name="Image"
	kind="class"
	purpose="Places an image as board artwork, mapped onto the board's real palette: exposed copper,
		silkscreen, and solder-mask openings. The fab's mask color is the background — you don't
		paint it, you order it."
	imports={"import { Image } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={basicExample} label="badge.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">The inks</h3>
	<p class="text-sm leading-relaxed">
		A finished board has three "colors" plus the substrate. Each pixel takes the nearest ink;
		anything else — including transparent pixels — is background:
	</p>
	<DocsTable headers={['Pixel color', 'Ink', 'Emits onto']} rows={inkRows} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Options</h3>
	<DocsTable headers={['Option', 'What it does']} rows={options} monoCols={[0]} />

	<Callout label="Note">
		Your logo is probably not red, white, and blue. Map its actual colors with
		<code>inks</code> — a teal logo on transparency becomes copper with one line:
	</Callout>
	<CodeBlock code={realLogo} label="mod-ec.ts" class="mt-2" />
	<p class="mt-2 text-sm leading-relaxed">
		Export PNGs with flat colors and antialiasing off when you can. <code>tolerance</code>
		decides how much of the antialiased fringe still counts — lower it to ignore more.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Geometry</h3>
	<p class="text-sm leading-relaxed">
		Raster art is traced into contour rings by default: each ink becomes a handful of polygons,
		with holes bridged in as hairline slits — the same trick KiCAD's own image converter uses,
		because a <code>gr_poly</code> is a single ring. A 20&nbsp;mm logo lands as roughly 150
		points of gerber. <code>mode: 'rects'</code> gives the exact cell grid as merged
		rectangles instead, and <code>smooth</code> straightens grid staircases (0 keeps every
		vertex).
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">SVG</h3>
	<p class="text-sm leading-relaxed">
		SVG goes in as vector and comes out as vector — curves flatten to polygons at your placed
		size, so there's no raster grid and <code>mode</code> doesn't apply:
	</p>
	<CodeBlock code={svgExample} label="logo.ts" class="mt-2" />
	<p class="mt-2 text-sm leading-relaxed">
		A shape with no <code>fill</code> attribute anywhere on its chain is the artwork itself and
		lands on copper. Subpaths nest, so a donut is one path. We read
		<code>path</code>/<code>rect</code>/<code>circle</code>/<code>ellipse</code>/<code>polygon</code>
		with transforms and presentation attributes.
	</p>
	<Callout>
		Not read from SVG: strokes, text, <code>use</code>/<code>symbol</code> references, clips,
		and CSS <code>&lt;style&gt;</code> blocks. Logo SVGs from Inkscape or Figma carry plain
		attributes and work as-is; if yours doesn't, flatten it first.
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Custom inks — layer stacks</h3>
	<p class="text-sm leading-relaxed">
		A fabbed board is three binary layers: copper, mask opening, silk. The three presets are
		fixed points in that cube; <code>inks.custom</code> maps any additional pixel color to any
		other combination:
	</p>
	<CodeBlock code={stackExample} label="stacks.ts" class="mt-2" />
	<p class="mt-2 text-sm leading-relaxed">
		<code>{'{ copper: true }'}</code> is hidden copper — electrically real, visually absent; usually
		you want it under a ground pour or not at all. <code>maskPaint</code> is the subtractive
		channel: it <em>closes</em> mask openings, which is how you get two-tone mask art (mask color
		and substrate color, no metal). Painting mask back over exposed copper keeps the metal but
		hides it again — that's the precedence, not a special case.
	</p>
	<Callout>
		One combination is rejected at construction: silk stacked over a mask opening. Most fabs
		strip silkscreen over openings — pick silk or an opening, not both. If your fab will print
		it, set <code>allowExposedSilk: true</code> on the Image.
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Inside packages</h3>
	<p class="text-sm leading-relaxed">
		Artwork ships in reusable modules like any component — assign it in <code>build()</code>
		with package-local coordinates and the package offset moves it with the parts:
	</p>
	<CodeBlock code={packageExample} label="badge.ts" class="mt-2" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Two things to know</h3>
	<p class="text-sm leading-relaxed">
		Copper artwork is non-net copper. Keep it clear of real nets yourself — the design rule
		check will flag collisions, which is it working. And dense silkscreen art trips
		<code>silk_overlap</code> warnings against its own polygons; art-heavy boards usually set
		<code>silk_overlap: ignore</code> in the conf severities.
	</p>
</ApiCard>

<p class="mt-8 text-sm leading-relaxed text-muted-foreground">
	You can also place and edit artwork by hand in the
	<a href="/pcb/docs/vscode" class="font-bold text-primary underline">VS Code layout view</a> —
	pick a PNG, click to drop it, then move, resize, flip, replace the file, or delete it, with
	apply writing the same <code>Image</code> statements back to source.
</p>
