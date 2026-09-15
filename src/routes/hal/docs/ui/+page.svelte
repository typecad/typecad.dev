<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const uiFile = `<screen>
  <view class="col">
    <text class="title">{count} taps</text>
    <button on:click={() => count++}>tap me</button>
  </view>
</screen>

<style>
  .col { flex-direction: column; gap: 12; align-items: center; }
  .title { font-size: 24; }
  button { padding: 10 20; }
</style>

<script lang="ts">
  import { ui } from '@typecad/hal';
  const count = ui.signal(0);
<\/script>`;

	const api = [
		['ui.mount(tree, opts?)', 'Mount a screen — display facts usually live in the config\u2019s display block'],
		['ui.signal(initial)', 'Reactive value: call it to read, .set() to write — screens re-render on change'],
		['ui.bind(node, prop, compute)', 'Bind a node property to a computed value'],
		['ui.bindList(node, countFn, itemFn, onTap?)', 'Virtualized list — only visible items render'],
		['ui.bindInput(node, onCommit)', 'On-screen keyboard input'],
		['ui.watchPin(pin, onFalling)', 'Poll a physical button (~20 ms, no ISRs)'],
		['await ui.onTap(node?)', 'Awaitable taps — menus and flows read top to bottom'],
		['ui.drawCanvas(node, draw)', 'Canvas drawing — CSS colors become RGB565 at build time']
	];

	const elements = [
		['Layout', '<screen> root · <view> containers · <text> · <img>'],
		['Input', '<button> · <check> · <radio> · <select> · <input> · <range>'],
		['Display', '<progress> · <range> · <canvas>'],
		['Wiring', '{expr} interpolation · on:click/hold/release/change · bind:text / bind:value · ref=']
	];

	const cssSupport = [
		['Layout', 'Flexbox — direction, gap, grow/shrink, align/justify, wrap, position, z-index'],
		['Boxes', 'Padding/margin shorthands, borders, border-radius, aspect-ratio, overflow scroll'],
		['Type', 'Font shorthand, size, weight, text-align/decoration, custom fonts with build-time glyph subsetting'],
		['Color', 'All CSS formats plus the named colors'],
		['States & themes', ':pressed, CSS variables, theme imports'],
		['Cost', 'Zero at runtime — layout resolves at build time, styles compile to draw lists']
	];

	const displayConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  entry: './src/app.ui',
  display: {
    driver: 'ilitek,ili9341',  // any panel your Zephyr SDK binds — drop-in
    width: 320, height: 240,
    rotation: 90,
    backlightPin: 23,
  },
};

export default config;`;
</script>

<svelte:head>
	<title>UI — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Build display UIs with HTML and CSS: .ui files compile to efficient C++ draw calls — Yoga layout, RGB565, font subsetting — with reactive signals."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">UI</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Displays get the same treatment as everything else: author with HTML and CSS, and the build
	compiles it — layout solved at build time (Yoga), styles folded into draw lists, fonts
	subsetted to the glyphs you use, pixels as RGB565. Nothing like a browser runs on the board.
</p>

<ApiCard
	name="the .ui file"
	kind="format"
	purpose="A single file: markup, style, and a script. Point the config's entry at it and the
		transpiler does the rest. The syntax is Svelte-compatible — braces interpolate, on: and
		bind: wire events and values."
	imports={"entry: './src/app.ui'"}>
	{#snippet example()}
		<CodeBlock code={uiFile} label="app.ui" />
	{/snippet}
	<CodeBlock code={displayConfig} label="typecad-hal.config.ts" class="mt-3" />
	<Callout>
		<code>typecad-hal preview</code> renders the screen in a browser against the real layout
		engine — iterate on the UI without a board attached.
	</Callout>
</ApiCard>

<ApiCard
	name="the ui API"
	kind="functions"
	purpose="The script side: reactive state, bindings, input, and canvases. Everything is a
		compile-time construct — each call lowers to specific draw or read code."
	imports={"import { ui } from '@typecad/hal'"}>
	{#snippet example()}
		<DocsTable headers={['Call', 'What it does']} rows={api} monoCols={[0]} />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Elements</h3>
	<DocsTable headers={['Group', 'Elements']} rows={elements} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="the CSS subset"
	kind="reference"
	purpose="The layout-critical part of CSS, resolved entirely at build time. Unsupported
		properties are build warnings — errors with --strict-css."
	imports={"<style> in a .ui file"}>
	{#snippet example()}
		<DocsTable headers={['Area', 'Supported']} rows={cssSupport} monoCols={[0]} />
	{/snippet}
</ApiCard>
