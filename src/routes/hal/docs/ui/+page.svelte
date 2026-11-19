<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import UiShot from '$lib/components/docs/ui-shot.svelte';

	const counterUi = `<script>
  import { ui } from '@typecad/ui';

  ui.mount(screen);

  export const count = ui.signal(0);

  export function incrementTaps() {
    count.set(count() + 1);
  }
<\/script>

<style>
  screen { background: #ffffff; gap: 12px; padding: 16px; align-items: center; }
  #label { color: #333333; font-size: 18px; }
  #tapBtn {
    background: #3399ff;
    border: 2px solid #1a73e8;
    border-radius: 8px;
  }
</style>

<screen id="counter">
  <text id="label">taps: {count}</text>
  <button id="tapBtn" on:click={incrementTaps}>tap me</button>
</screen>`;

	const displayConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  entry: './src/app.ui',
  display: {
    driver: 'ilitek,ili9341',
    width: 320, height: 240,
    rotation: 90,
    cs: 5, dc: 21, rst: 22,
    backlightPin: 23,
    // touch: { library: 'FT6336U', sda: 8, scl: 9, calibration: { ... } },
  },
};

export default config;`;

	const splitMain = `import { ui } from '@typecad/ui';
import { screen } from './panel.ui.html';

ui.mount(screen);

export const level = ui.signal(0);

screen.pumpBtn.onClick(() => {
  level.set(level() + 1);
});`;

	const formats = [
		['app.ui', 'One file: <script>, <style>, and markup. `screen` is in scope automatically. Point `entry` straight at it'],
		['panel.ui.html + panel.ui.css', 'Markup and a sibling stylesheet (loaded by name), imported from a .ts file with `import { screen } from \'./panel.ui.html\'`'],
		['types/…/*.ui.d.html.ts', 'Generated on every build. Gives `screen.<id>` its element type, so the editor autocompletes handles and catches typos'],
	];

	const pipeline = [
		['Parse', 'HTML-ish markup → a node tree. HTML tags (div, p, h1, span…) map onto a handful of native elements'],
		['Style', 'The built-in shadcn kit, your stylesheet, and <style> blocks cascade into resolved styles per node'],
		['Layout', 'Yoga (flexbox) runs at build time against the display size from your config'],
		['Lower', 'Nodes become a static C++ table; colors are packed for the panel (RGB565, gray, or 1-bit); fonts are rasterized and subsetted to the glyphs you use'],
		['Run', 'A small retained-mode runtime: a tick polls bindings, repaints dirty rectangles, and routes touch'],
	];

	const scriptRules = [
		['One <script> per .ui file', 'The first one wins. Any others are dropped without a warning'],
		['Handlers are named exports', '`on:click={fn}` takes a function name, not an inline arrow. Write `export function fn() {…}`'],
		['Signals are scalars', '`ui.signal()` takes a number, string, or boolean literal. Objects and arrays are rejected'],
		['Callbacks are a TS subset', 'let/const, if/else, loops, `signal.set()`, element reads/writes. Anything else is a `ui-callback-unsupported-statement` error'],
	];

	const pages = [
		['Elements', '/hal/docs/ui-elements', 'Every tag and attribute: layout, text, form controls, lists, canvas, images, keyboards, drawers, screens and navigation'],
		['Reactivity & events', '/hal/docs/ui-reactivity', 'Signals, {expr}, on: and bind:, ui.bind, element handles, GPIO buttons, awaitable taps'],
		['Styling', '/hal/docs/ui-styling', 'The CSS subset: selectors, properties, units, variables, fonts, animation, themes and the shadcn kit'],
		['Displays', '/hal/docs/displays', 'Panels, wiring, quirk flags, and touch controllers'],
	];
</script>

<svelte:head>
	<title>UI — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Build display UIs in HTML and CSS: .ui files compile to a static C++ node table with build-time flexbox layout, packed colors, subsetted fonts, and reactive signals."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🖥️ UI</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	You write the screen in HTML and CSS, and the build compiles it to C++. Layout is solved at
	build time, styles fold into a static node table, fonts are subsetted to the glyphs you use,
	and colors are packed for your panel. Nothing like a browser runs on the board. That also
	means it's a subset: the parts of HTML and CSS that make sense on a 320×240 panel, with
	warnings for the rest.
</p>

<ul class="mt-4 list-disc space-y-1 pl-5 text-sm leading-relaxed">
	<li>
		<a class="font-bold text-primary underline hover:no-underline" href="/hal/docs/ui-elements">Elements</a> —
		what you can put on a screen
	</li>
	<li>
		<a class="font-bold text-primary underline hover:no-underline" href="/hal/docs/ui-reactivity">Reactivity &amp; events</a> —
		getting live data on screen and input back out
	</li>
	<li>
		<a class="font-bold text-primary underline hover:no-underline" href="/hal/docs/ui-styling">Styling</a> —
		the CSS that works, and what doesn't
	</li>
</ul>

<ApiCard
	name="a first screen"
	kind="format"
	purpose="A `.ui` file holds a script, a stylesheet, and markup, in any order. Point the config's `entry` at it. The syntax will look familiar if you've used Svelte, but it's a much smaller language."
	imports={"entry: './src/app.ui'"}>
	{#snippet example()}
		<CodeBlock code={counterUi} label="src/app.ui" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		<code>ui.mount(screen)</code> draws the first frame. <code>{'{count}'}</code> in the text
		re-renders whenever <code>count</code> changes. <code>on:click</code> calls the exported
		function on a tap. The <code>screen</code> name is injected for you in a <code>.ui</code>
		file: every element with an <code>id</code> is reachable as <code>screen.&lt;id&gt;</code>.
	</p>
	<UiShot
		shots={[
			{ src: '/hal/ui/counter.png', alt: 'The counter screen at boot: "taps: 0" above a blue "tap me" button', label: 'at boot' },
			{ src: '/hal/ui/counter-tapped.png', alt: 'The same screen after three taps: "taps: 3"', label: 'after three taps' }
		]}
		caption="src/app.ui on a 320 px wide panel" />
	<CodeBlock code={displayConfig} label="typecad-hal.config.ts" class="mt-3" />
	<Callout label="Tip">
		Run <code>npx @typecad/ui --config</code> inside a project and it'll ask which panel you
		have, how it's wired, and whether there's touch, then write the <code>display</code> block
		for you. The full list of fields is on the
		<a class="underline" href="/hal/docs/displays">Displays</a> page.
	</Callout>
</ApiCard>

<ApiCard
	name="🔎 preview in a browser"
	kind="workflow"
	purpose="Most UI iteration happens with no board attached."
	imports={'typecad-hal preview'}>
	{#snippet example()}
		<CodeBlock code={'typecad-hal preview\n# → http://127.0.0.1:5174  (--port to change, --config for another config)'} label="terminal" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The preview runs the same parser, cascade, and layout engine as the firmware build, and
		draws into a canvas at your display's size. It interprets your script's top-level
		statements (<code>ui.bind</code>, <code>bindList</code>, <code>drawCanvas</code>, element
		handlers, <code>setInterval</code>). Code inside threads or hardware drivers doesn't run
		there, so wire fake data at the top level while you iterate.
	</p>
	<Callout>
		The preview finds elements by <code>id</code>. An <code>&lt;img&gt;</code>, an
		<code>on:</code> handler, or a <code>{'{expr}'}</code> on an element without an id won't
		wire up in the preview, and you'll get a warning that says so. On the device,
		<code>&lt;img&gt;</code> needs an id too.
	</Callout>
</ApiCard>

<ApiCard
	name="two ways to organize files"
	kind="reference"
	purpose="Use the single-file `.ui` for most screens. Split into `.ui.html` + `.ui.css` + TypeScript when the UI is one part of a larger program."
	imports={"import { screen } from './panel.ui.html'"}>
	{#snippet example()}
		<DocsTable headers={['File', 'What it is']} rows={formats} monoCols={[0]} />
	{/snippet}
	<CodeBlock code={splitMain} label="src/main.ts (split layout)" class="mt-3" />
	<p class="mt-3 text-sm leading-relaxed">
		You can alias the import (<code>import {'{'} screen as nav {'}'}</code>), but
		<code>ui.drawer</code>, <code>ui.dialog</code>, <code>ui.toast</code>, and
		<code>screen.groups.*</code> look for the name <code>screen</code>, so keep it unless you
		have a reason. A <code>&lt;link rel="stylesheet"&gt;</code> in the markup is ignored. The
		sibling <code>.ui.css</code> loads by filename.
	</p>
</ApiCard>

<ApiCard
	name="the script, in short"
	kind="rules"
	purpose="The script is TypeScript that the transpiler lowers to C++, and the `ui.*` calls are compile-time constructs. A few rules follow from that."
	imports={"import { ui } from '@typecad/ui'"}>
	{#snippet example()}
		<DocsTable headers={['Rule', 'Why / what happens']} rows={scriptRules} monoCols={[0]} />
	{/snippet}
	<p class="mt-3 text-sm leading-relaxed">
		Calling a <code>ui.*</code> function from plain Node (a unit test, a script) throws a
		"compile-time construct" error on purpose. That way a missed build step fails loudly
		instead of doing nothing.
	</p>
</ApiCard>

<ApiCard
	name="how it compiles"
	kind="reference"
	purpose="You don't need this to build screens, but it explains most of the limits."
	imports={'.ui → C++ node table'}>
	{#snippet example()}
		<DocsTable headers={['Stage', 'What happens']} rows={pipeline} monoCols={[0]} />
	{/snippet}
	<Callout label="Note">
		Because layout runs at build time, a node's position is fixed at its laid-out spot.
		Bindings can change text, colors, visibility, and values. They can't reflow the tree, so a
		longer string won't push its siblings down. Size containers for the longest text you
		expect.
	</Callout>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold">📒 The rest of the UI docs</h2>
<ul class="mt-4 space-y-2 text-sm leading-relaxed">
	{#each pages as [title, href, covers] (href)}
		<li>
			<a class="font-bold text-primary underline hover:no-underline" {href}>{title}</a>
			<span class="text-muted-foreground"> — {covers}</span>
		</li>
	{/each}
</ul>
<p class="mt-6 text-sm leading-relaxed text-muted-foreground">
	The demos in the hal repo (<code>demos/zephyr-ui</code>, <code>demos/demo-shadcn</code>,
	<code>demos/native_demo</code>) exercise nearly everything on these pages. If you find
	something that behaves differently from what's written here, open an issue on
	<a class="underline" href="https://github.com/typecad">github.com/typecad</a>.
</p>
