<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import UiShot from '$lib/components/docs/ui-shot.svelte';

	const order = [
		['1. UA defaults', 'Built-in sizes for headings, buttons, inputs… scaled to the display height (16 px root at ≥300 px tall, 14 px at ≥150, 12 px below)'],
		['2. shadcn kit', 'Always loaded first among author styles: tokens plus .btn, .card, .badge… recipes'],
		['3. Your stylesheet', 'The sibling .ui.css (or display.themeCss if set), then every <style> block'],
		['4. style=""', 'Inline declarations beat everything'],
	];

	const selectors = [
		['tag · .class · #id', 'Yes. Tag selectors match the HTML name too, so div and p work'],
		['a.b#c (compound)', 'Yes'],
		['A, B (lists)', 'Yes'],
		['A B · A > B · A + B · A ~ B', 'Yes'],
		['[attr] · [attr=value]', 'Yes, for type, name, value, href, src, placeholder, maxlength, checked, disabled, hidden. data-* never matches'],
		['[attr^=…] and other operators', 'Parsed, but treated as plain ='],
		[':not(simple)', 'Yes, one simple compound'],
		[':pressed (alias :active)', 'Yes — while touched or the bound pin is held'],
		[':checked', 'Yes — background and color only, on check / radio / select / .switch'],
		[':disabled', 'Yes — elements with the disabled attribute'],
		[':focus', 'Parsed, never matches'],
		[':hover, :first-child, ::before…', 'No. The rule silently never matches (no warning)'],
		['*', 'No'],
		['!important', 'No — ignored'],
	];

	const units = [
		['px or bare number', 'Everywhere. 12 and 12px are the same'],
		['%', 'Sizes, padding, margin, position, flex-basis — resolved against the parent at build time'],
		['rem / em', 'Fixed at 16 px (not relative to the parent). Converted for sizes, spacing in layout, font-size, and calc()'],
		['ms / s', 'transition and animation durations'],
		['deg · turn · rad', 'rotate()'],
		['vw · vh · pt · ch', 'Not supported — sizes read as 0'],
	];

	const layoutProps = [
		['display', 'flex · none. Everything else (block, grid, inline…) lays out as a column; grid/inline warn css-display'],
		['flex-direction', 'row · row-reverse · column · column-reverse — only on an element that is itself display: flex'],
		['justify-content', 'flex-start · center · flex-end · space-between · space-around · space-evenly'],
		['align-items', 'flex-start · center · flex-end · stretch'],
		['align-self', 'flex-start · center · flex-end · stretch · baseline'],
		['align-content', 'flex-start · center · flex-end · stretch · space-between · space-around · space-evenly'],
		['flex-wrap', 'nowrap · wrap · wrap-reverse'],
		['flex · flex-grow · flex-shrink · flex-basis', 'Standard shorthand rules (flex: 1 = 1 1 0%)'],
		['gap · row-gap · column-gap', 'Lengths'],
		['order', 'Integer'],
		['position', 'relative · absolute. fixed and sticky warn and act as static'],
		['top · right · bottom · left', 'Lengths or %'],
		['z-index', 'Integer. Adds up down the tree — a child\'s z is its parent\'s plus its own'],
	];

	const boxProps = [
		['width · height · min-* · max-*', 'Length, %, or auto'],
		['aspect-ratio', '16 / 9, 1.5, or auto'],
		['padding', '1–4 values. There are no padding-top/-left… longhands; use the shorthand'],
		['margin · margin-top/-right/-bottom/-left', '1–4 values, %, and auto (margin: 0 auto centers)'],
		['box-sizing', 'Always border-box. content-box warns css-box-sizing and is ignored'],
		['overflow', 'scroll or hidden make a vertical scroll container. visible/auto do nothing'],
		['border', 'width style color in any order. solid · dashed · dotted (drawn dashed) · none. Width clamps to 1–8 px'],
		['border-width · border-color · border-style', 'Longhands for all four sides'],
		['border-top/-right/-bottom/-left', 'Per-side width works; per-side color does not (the node\'s border color is used)'],
		['border-radius', 'One value, in px, up to 255'],
		['outline', 'width style color, 1–8 px. No outline-offset'],
		['box-shadow', 'Up to 4: [inset] x y [blur] color. Integer offsets, blur 0–8, spread ignored. Shadow alpha is honored'],
	];

	const paintProps = [
		['color', 'Text color. Inherited. Also the default border and outline color'],
		['background · background-color', 'A color, or linear-gradient() with two stops: to right / to left is horizontal, anything else vertical. No url(), no radial'],
		['opacity', '0–1 or %. Compounds with ancestors'],
		['visibility', 'hidden · collapse — invisible, keeps its space. Inherited'],
		['transform', 'translate/X/Y/3d (px, %), scale/X/Y/3d (0–4×), rotate (quarter turns render exactly). skew/matrix ignored'],
		['transform-origin', 'Keywords or %'],
		['object-fit', 'fill · contain · cover · scale-down · none (on <img>)'],
	];

	const textProps = [
		['font', '[style] [weight] size[/line-height] family'],
		['font-family', 'First family only. Must match an @font-face (or the bundled DejaVu Sans / DejaVu Sans Mono)'],
		['font-size', 'px. rem/em convert at 16 px and warn css-font-size-unit; % is ignored'],
		['font-weight', 'normal · bold · lighter · 100–900 — picks a face, never fakes bold'],
		['font-style', 'normal · italic · oblique — picks a face'],
		['font-smoothing', 'antialiased (default on color panels) · none. -webkit-font-smoothing works too'],
		['font-subset', 'exact (default) · fallback. Which glyphs get compiled in — see fonts below'],
		['text-align', 'left · center · right'],
		['text-decoration', 'underline · line-through. Not inherited'],
		['text-transform', 'uppercase · lowercase · capitalize'],
		['text-overflow', 'ellipsis (with white-space: nowrap + overflow: hidden)'],
		['white-space', 'normal · nowrap · pre · pre-line'],
		['line-height', 'px, %, or a unitless multiplier'],
		['letter-spacing', 'px'],
		['text-shadow', 'One shadow, same syntax as box-shadow'],
	];

	const fontFace = `@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Regular.ttf");
  font-weight: 400;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Bold.ttf");
  font-weight: 700;
}

screen { font-family: "Inter"; }
.reading { font-size: 40px; font-weight: bold; font-subset: fallback; }`;

	const animCss = `#saveBtn {
  background: var(--primary);
  transition: background 120ms;
}
#saveBtn:pressed { background: var(--accent); transform: translateY(1px); }

@keyframes pulse {
  0%, 100% { background: #29d391; }
  50%      { background: #f6c84c; }
}
.live { animation: pulse 1200ms infinite ease-in-out; }`;

	const animNotes = [
		['transition', 'background or color only, toward a :pressed state. `all` isn\'t supported'],
		['animation + longhands', 'name, duration, iteration-count (n or infinite), delay, timing-function. First animation only'],
		['timing functions', 'linear · ease · ease-in · ease-out · ease-in-out. cubic-bezier() and steps() run linear'],
		['@keyframes stops', 'from · to · N% (comma lists fine)'],
		['animatable', 'background, color, opacity, transform, left/top (added to translate), width, height'],
	];

	const varsCss = `:root {
  --brand: #ef5b3f;
  --pad: 8px;
}
.dark {                 /* used when display.themeClass is 'dark' */
  --brand: #ff765c;
}

.card { padding: calc(var(--pad) * 2); border: 1px solid var(--brand); }

@media (max-width: 240px) {
  .card { padding: var(--pad); }
}
@media (monochrome) {
  .card { border-width: 2px; }
}`;

	const media = [
		['(min-|max-)(width|height): Npx', 'Against the display size in the config'],
		['(monochrome) · (monochrome: N)', '1-bit panels'],
		['(e-ink) · (update: slow|fast)', 'E-paper panels are slow'],
		['(color-gamut: srgb)', 'True; p3 is false'],
	];

	const themeCss = `/* app.ui <style>, or a .ui.css */
@import "@typecad/ui/themes/zinc.css";

/* the packaged themes set --radius in rem, which border-radius can't read */
:root { --radius: 8px; }`;

	const kit = [
		['Buttons', '.btn + .btn-primary · .btn-secondary · .btn-outline · .btn-ghost · .btn-destructive; sizes .btn-sm · .btn-lg · .btn-block'],
		['Badges', '.badge · .badge-secondary · .badge-destructive · .badge-outline'],
		['Cards', '.card · .card-header · .card-title · .card-description · .card-content · .card-footer'],
		['Forms', '.input · .form-label · .switch · .input-error · .field-error · .field-success'],
		['Feedback', '.alert · .alert-destructive · .alert-title · .alert-description · .progress · .skeleton · .spinner'],
		['Overlays', '.dialog-scrim · .dialog-card · .dialog-footer · .toast · .toast-title · .toast-description'],
		['Structure', '.row · .separator · .vseparator · .tabs-list · .tabs-trigger · .tabs-content · .accordion…'],
		['Tokens', '--background · --foreground · --card · --primary · --secondary · --muted · --accent · --destructive (each with -foreground) · --border · --input · --radius'],
	];

	const colors = [
		['#rgb · #rrggbb · #rrggbbaa', 'Alpha is dropped (#rgba isn\'t supported)'],
		['rgb() · rgba()', 'Integer channels, comma or space syntax'],
		['hsl() · hsla()', 'Including bare shadcn triplets like 221.2 83.2% 53.3%'],
		['oklch()', 'Converted at build time'],
		['Named colors', 'All 148'],
		['transparent', 'No fill on backgrounds'],
		['Not supported', 'currentColor · color-mix() · lab() · hwb() — build error'],
	];

	const displayKinds = [
		['Color TFT (RGB565)', 'Colors are truncated to 5-6-5 at build time. Bundled DejaVu fonts, antialiased'],
		['Grayscale', 'Rec. 601 luminance per color'],
		['1-bit (OLED, mono)', 'Luminance threshold. Shadows, opacity, and radius are dropped and gradients flatten, each with a css-mono-* warning. :pressed inverts instead of transitioning. Stock bitmap font unless you add @font-face'],
		['E-ink', 'Transitions and keyframes are removed. Use @media (e-ink) for e-ink-specific rules'],
	];

	const diagnostics = [
		['unknown-css-property', 'Property not supported — dropped'],
		['css-display · css-position · css-box-sizing', 'Value not supported — falls back as described above'],
		['css-font-size-unit · css-line-height', 'Unit converted or ignored'],
		['css-alpha-ignored', 'Partial alpha in a color — rendered opaque'],
		['css-font-size-viewport · css-min-height-viewport', 'Something is suspiciously big for this display'],
		['css-mono-*', 'An effect a 1-bit panel can\'t show'],
		['unsupported-at-rule · unsupported-media-condition', '@supports, remote @import, or a media feature we don\'t evaluate'],
		['layout-viewport-overflow · layout-text-overflow', 'Something lands past the screen or its parent'],
	];

	const gaps = [
		'No grid, no inline-block, no floats. Everything is flexbox',
		'No var() fallbacks — var(--x, red) stays literal text. Undefined variables become empty',
		'No var() or calc() in inline style="" attributes — put those in a stylesheet',
		'rem/em are converted for sizes and font-size, but border-radius, letter-spacing, and line-height read only the leading number (0.5rem → 0). Use px there',
		'Only the border shorthand\'s width counts toward layout. border-width alone draws but doesn\'t take space',
		'Unknown pseudo-classes fail silently. If a rule never applies, check for :hover or :first-child',
		'--strict-css upgrades css-* warnings to errors. It doesn\'t upgrade unknown-css-property',
	];
</script>

<svelte:head>
	<title>UI styling — typeCAD/hal docs</title>
	<meta
		name="description"
		content="The CSS subset typeCAD/hal UIs compile: selectors, units, flexbox layout, borders and shadows, fonts with build-time subsetting, transitions and keyframes, variables, @media, themes, and the shadcn kit."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🎨 UI styling</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The CSS is resolved entirely at build time. Selectors, variables, <code>calc()</code>, and
	<code>@media</code> are all evaluated against your display before anything reaches the
	board, so the device only ever sees final numbers. It's a real subset, so expect gaps. This
	page lists what works, and the build warns about most of what doesn't.
</p>

<ApiCard
	name="where styles come from"
	kind="cascade"
	purpose="Four layers, later wins. Inside your stylesheet, normal specificity then source order decides."
	imports={'<style> · .ui.css · style=""'}>
	{#snippet example()}
		<DocsTable headers={['Layer', 'What it holds']} rows={order} monoCols={[0]} />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The shadcn kit counts as author CSS. A kit rule with higher specificity than yours (like
		<code>.btn:pressed</code> or <code>check:checked</code>) still wins, so match or beat its
		selector when you override it.
	</p>
</ApiCard>

<ApiCard
	name="selectors"
	kind="reference"
	purpose="Most of what you'd write by hand. The structural pseudo-classes are missing."
	imports={'tag .class #id > + ~ :pressed'}>
	{#snippet example()}
		<DocsTable headers={['Selector', 'Supported']} rows={selectors} monoCols={[0]} />
	{/snippet}
	<Callout label="Note">
		<code>:pressed</code> is ours, not standard CSS. It's the state you'd normally get from
		<code>:active</code>, and <code>:active</code> works as an alias. Under
		<code>:pressed</code> you can change background, color, and position
		(<code>top</code>/<code>left</code> or <code>transform</code>) for a press-down effect.
	</Callout>
	<UiShot
		shots={[{ src: '/hal/ui/pressed.png', alt: 'Two identical buttons; the right one is held down, darker and shifted 2 px onto its shadow' }]}
		caption=".btn-demo:pressed {'{'} background: #1a73e8; transform: translate(2px, 2px); {'}'} — right button held" />
</ApiCard>

<ApiCard
	name="units"
	kind="reference"
	purpose="Bare numbers are pixels. Relative units are resolved once, at build time."
	imports={'px · % · rem'}>
	{#snippet example()}
		<DocsTable headers={['Unit', 'Where it works']} rows={units} monoCols={[0]} />
	{/snippet}
</ApiCard>

<ApiCard
	name="📐 layout"
	kind="properties"
	purpose="Layout is flexbox, solved by Yoga at build time. `screen`, `body`, `view`, and the HTML containers that map to view (div, section, header…) are flex columns by default."
	imports={'display: flex'}>
	{#snippet example()}
		<DocsTable headers={['Property', 'Values']} rows={layoutProps} monoCols={[0]} />
	{/snippet}
	<CodeBlock
		code={`.row  { display: flex; flex-direction: row; gap: 8px; align-items: center; }
.grow { flex: 1; }
.badge-corner { position: absolute; right: 4px; top: 4px; z-index: 2; }`}
		label="style" />
	<UiShot
		shots={[{ src: '/hal/ui/layout.png', alt: 'Three rows: A, a wide green flex:1 box, C; then A B C spread with space-between; then an absolutely positioned red z:2 badge in a corner over a yellow box' }]}
		caption="flex: 1, justify-content: space-between, and position: absolute with z-index" />
	<Callout>
		<code>flex-direction</code> only applies when the same element is
		<code>display: flex</code>. Views already are. A <code>&lt;p&gt;</code>,
		<code>&lt;li&gt;</code>, or <code>&lt;span&gt;</code> is a text node, so give it
		<code>display: flex</code> first or wrap it in a <code>&lt;div&gt;</code>.
	</Callout>
</ApiCard>

<ApiCard
	name="boxes, borders & shadows"
	kind="properties"
	purpose="Sizing, spacing, and decoration."
	imports={'padding · margin · border · box-shadow'}>
	{#snippet example()}
		<DocsTable headers={['Property', 'Values / notes']} rows={boxProps} monoCols={[0]} />
	{/snippet}
	<UiShot
		shots={[{ src: '/hal/ui/boxes.png', alt: 'Six boxes: solid border, dashed border, 12 px radius, offset box-shadow, outline, and a vertical gradient' }]}
		caption="border, border-radius, box-shadow, outline, linear-gradient" />
</ApiCard>

<ApiCard
	name="color, background & transforms"
	kind="properties"
	purpose="What gets painted, and where."
	imports={'color · background · opacity · transform'}>
	{#snippet example()}
		<DocsTable headers={['Property', 'Values / notes']} rows={paintProps} monoCols={[0]} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Color formats</h3>
	<div class="mt-2"><DocsTable headers={['Format', 'Notes']} rows={colors} monoCols={[0]} /></div>
	<p class="mt-3 text-sm leading-relaxed">
		There's no alpha blending on the device. A color with partial alpha renders opaque and warns
		<code>css-alpha-ignored</code>. The exceptions are box and text shadows, and
		<code>opacity</code>, which is applied when the node is drawn.
	</p>
	<Callout>
		Two-stop gradients currently draw in reverse: <code>linear-gradient(#3399ff, #29d391)</code>
		comes out green at the top and blue at the bottom, on the device and in the preview. The
		boxes image above shows it. Swap your stops until the fix lands. And put text next to a
		gradient rather than on it, because a text node paints a solid box behind its glyphs.
	</Callout>
</ApiCard>

<ApiCard
	name="🔤 text & fonts"
	kind="properties"
	purpose="Fonts are rasterized at build time at exactly the sizes and weights you use, and subsetted to the characters that appear. Color displays get DejaVu Sans and DejaVu Sans Mono (400 and 700) without you doing anything."
	imports={'@font-face · font · font-subset'}>
	{#snippet example()}
		<DocsTable headers={['Property', 'Values / notes']} rows={textProps} monoCols={[0]} />
	{/snippet}
	<UiShot
		shots={[{ src: '/hal/ui/text.png', alt: 'Headings, regular bold and italic runs, underline, tracked uppercase, DejaVu Sans Mono, an ellipsis, and aliased text' }]}
		caption="headings, weights, decoration, transform, the bundled mono face, ellipsis, font-smoothing: none" />
	<CodeBlock code={fontFace} label="style" class="mt-3" />
	<ul class="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>
			<code>src</code> is a local TTF/OTF path, relative to the stylesheet. Remote URLs are an
			error. Faces match by family name, then style, then the closest weight. No face means no
			bold or italic. It doesn't fake either. The bundled DejaVu faces are regular and bold only,
			so <code>&lt;i&gt;</code> and <code>font-style: italic</code> need an italic
			<code>@font-face</code> to look any different.
		</li>
		<li>
			<strong>Subsetting.</strong> By default only the characters in your static text,
			placeholders, and option labels are compiled in, plus <code>0-9 . , - + / ( ) %</code>
			when the text has a <code>{'{expr}'}</code>. Text that's bound at runtime, list rows,
			and 1-bit displays automatically get the wider ASCII fallback set. If a glyph is missing
			from text you set from script, add <code>font-subset: fallback</code> to that element.
		</li>
		<li>Each (file, size, weight, style) combination is a separate bitmap in flash, so a design with eight font sizes costs eight fonts.</li>
		<li>
			Without a matching <code>@font-face</code> (the default on 1-bit panels), text uses a
			stock bitmap font in four steps: ≤12 px, 13–20, 21–28, and 29+.
		</li>
	</ul>
</ApiCard>

<ApiCard
	name="✨ transitions & animation"
	kind="properties"
	purpose="Press feedback and simple looping animation. Interpolation runs on the device, and everything else is resolved ahead of time."
	imports={'transition · @keyframes · animation'}>
	{#snippet example()}
		<CodeBlock code={animCss} label="style" />
	{/snippet}
	<DocsTable headers={['Feature', 'Supported']} rows={animNotes} monoCols={[0]} />
	<p class="mt-3 text-sm leading-relaxed">
		<code>var()</code> inside <code>@keyframes</code> reads <code>:root</code> only, so a
		<code>.dark</code> override won't reach an animation. Rotation only renders cleanly at
		quarter turns.
	</p>
</ApiCard>

<ApiCard
	name="variables, calc() & @media"
	kind="at-rules"
	purpose="All three are evaluated at build time against the display in your config. They make one stylesheet work across panel sizes."
	imports={':root · var() · calc() · @media'}>
	{#snippet example()}
		<CodeBlock code={varsCss} label="style" />
	{/snippet}
	<ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>Variables are read from <code>:root</code>. Later definitions win, so yours override the kit's.</li>
		<li>
			A single-class block like <code>.dark {'{ --x: … }'}</code> overrides <code>:root</code>
			globally when that class is the config's <code>display.themeClass</code>. It's a
			build-time switch, not a runtime toggle.
		</li>
		<li><code>calc()</code> handles <code>+ - * /</code> with px, rem/em, and %. Mixing % with px in one calc() isn't resolved and reads as 0.</li>
		<li>Media conditions joined with <code>and</code> work. A comma doesn't mean "or" here.</li>
		<li><code>@import</code> inlines local files and package paths (<code>@typecad/ui/themes/…</code>). Remote URLs aren't fetched.</li>
	</ul>
	<div class="mt-3"><DocsTable headers={['@media feature', 'Matches']} rows={media} monoCols={[0]} /></div>
</ApiCard>

<ApiCard
	name="🎨 themes & the shadcn kit"
	kind="presets"
	purpose="The kit is always loaded: shadcn-style tokens and a set of class recipes. Import a theme to recolor it, or paste any ui.shadcn.com or tweakcn export."
	imports={'@import "@typecad/ui/themes/<name>.css"'}>
	{#snippet example()}
		<CodeBlock code={themeCss} label="style" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Packaged themes: <code>blue</code>, <code>gray</code>, <code>green</code>,
		<code>neutral</code>, <code>red</code>, <code>slate</code>, <code>stone</code>,
		<code>zinc</code>. Each defines <code>:root</code> and <code>.dark</code>. Pick dark with
		<code>display.themeClass: 'dark'</code>. <code>display.themeCss</code> swaps in a whole
		different stylesheet in place of the sibling <code>.ui.css</code>, which is handy for
		trying looks without touching markup.
	</p>
	<UiShot
		shots={[
			{ src: '/hal/ui/theme.png', alt: 'A kit card in the blue theme, light: white card, blue Pair button', label: 'blue.css' },
			{ src: '/hal/ui/theme-dark.png', alt: 'The same card in the blue theme, dark: near-black card, blue Pair button', label: "blue.css + themeClass: 'dark'" }
		]}
		caption="the card markup below, with the blue theme imported" />
	<div class="mt-3"><DocsTable headers={['Group', 'Classes']} rows={kit} monoCols={[1]} /></div>
	<CodeBlock
		code={`<view class="card">
  <view class="card-header">
    <text class="card-title">Sensor node</text>
    <text class="card-description">living room</text>
  </view>
  <view class="card-content">
    <view class="row">
      <button class="btn btn-primary btn-sm">Pair</button>
      <text class="badge badge-secondary">online</text>
    </view>
    <progress class="progress" value="62"></progress>
  </view>
</view>`}
		label="app.ui"
		class="mt-3" />
	<UiShot
		shots={[{ src: '/hal/ui/kit.png', alt: 'The kit with no theme: a card with Pair, Forget and an online badge, a progress bar, and a red Battery low alert' }]}
		caption="the kit's own tokens, no theme imported, plus an .alert-destructive" />
</ApiCard>

<ApiCard
	name="per display type"
	kind="reference"
	purpose="The same stylesheet builds for every panel. Here's what changes on the way down."
	imports={'display.colorFormat'}>
	{#snippet example()}
		<DocsTable headers={['Panel', 'What happens to your CSS']} rows={displayKinds} monoCols={[0]} />
	{/snippet}
	<UiShot
		shots={[
			{ src: '/hal/ui/panel.png', width: 256, alt: 'A 128×64 readout on a color panel: antialiased text, an orange gradient card with rounded corners and a shadow', label: 'rgb565, 128×64' },
			{ src: '/hal/ui/panel-mono.png', width: 256, alt: 'The same readout on a 1-bit panel: stock bitmap font, no gradient, radius or shadow', label: 'mono, 128×64' }
		]}
		caption="one stylesheet, two panels: the 1-bit build drops the gradient, radius, and shadow and uses the stock font" />
</ApiCard>

<ApiCard
	name="warnings & --strict-css"
	kind="diagnostics"
	purpose="Unsupported CSS is a warning, not a silent drop. Run with `--strict-css` to turn the `css-*` ones into errors in CI."
	imports={'typecad-hal build --strict-css'}>
	{#snippet example()}
		<DocsTable headers={['Code', 'Meaning']} rows={diagnostics} monoCols={[0]} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Gaps worth knowing up front</h3>
	<ul class="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
		{#each gaps as gap (gap)}
			<li>{gap}</li>
		{/each}
	</ul>
</ApiCard>

<p class="mt-10 text-sm leading-relaxed text-muted-foreground">
	Back to <a class="underline" href="/hal/docs/ui">UI</a> ·
	<a class="underline" href="/hal/docs/ui-elements">Elements</a> ·
	<a class="underline" href="/hal/docs/ui-reactivity">Reactivity &amp; events</a>. Found CSS
	that should work and doesn't? Open an issue on
	<a class="underline" href="https://github.com/typecad">github.com/typecad</a>.
</p>
