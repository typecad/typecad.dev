<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import UiShot from '$lib/components/docs/ui-shot.svelte';

	const native = [
		['<screen>', 'A full-display root. A file can hold several, and the first one in the file shows at boot', 'ViewElement'],
		['<view>', 'Container. Flex column by default', 'ViewElement'],
		['<text>', 'A run of text. Wraps to its box', 'TextElement'],
		['<button>', 'Tappable text with a border and a minimum height', 'ButtonElement'],
		['<check>', 'Checkbox. Tap toggles .value between 0 and 1', 'CheckElement'],
		['<radio>', 'Radio button. Radios with the same name are exclusive', 'RadioElement'],
		['<select>', 'Option picker. Tap opens a modal list; .value is the option index', 'SelectElement'],
		['<range>', 'Slider. Drag the thumb; .value runs min..max', 'RangeElement'],
		['<progress>', 'Read-only bar. .value is 0–100', 'ProgressElement'],
		['<input>', 'Single-line text or number field. Tap opens the on-screen keyboard', 'InputElement'],
		['<list>', 'Virtualized, scrollable list fed by ui.bindList', 'TextElement'],
		['<img>', 'An image converted at build time', 'TextElement'],
		['<canvas>', 'A pixel buffer you draw into with ui.drawCanvas', 'CanvasElement'],
		['<drawer> · <dialog> · <toast>', 'Overlays opened from script', 'TextElement'],
		['<keyboard> · <row> · <key>', 'A custom on-screen keyboard (sibling of <screen>)', '—'],
	];

	const aliases = [
		['view', 'body · div · header · footer · nav · main · section · article · aside · form · fieldset · ul · ol · dl · table · tr · thead · tbody · tfoot · hr'],
		['text', 'p · span · label · a · small · output · li · dt · dd · td · th · caption · h1–h6 · b · strong · i · em · u · code · kbd · samp · pre'],
		['progress', 'meter'],
		['input', 'textarea (single line only — warns html-textarea-single-line)'],
		['check / radio / range', '<input type="checkbox">, type="radio", type="range"'],
	];

	const attrs = [
		['id', 'Names the element for CSS (#id) and for script (screen.<id>). Interactive elements, <img>, and anything with a binding need one'],
		['ref', 'A script handle name separate from the CSS id. Works for event handlers; .value and .text access still go by id'],
		['class', 'Space-separated classes'],
		['style', 'Inline declarations. Beats every stylesheet rule. No var() or calc() inside'],
		['hidden', 'Same as display: none'],
		['disabled', 'Ignores input and matches :disabled'],
		['href="#screenId"', 'On <a> and <button>: tap navigates to that screen'],
		['on:click · on:hold · on:release · on:change', 'Call an exported function by name. See Reactivity & events'],
		['bind:text · bind:value', 'Two-way link to a signal. See Reactivity & events'],
	];

	const controls = [
		['<button>', 'href', 'Taps fire on:click (under 600 ms) or on:hold (600 ms or longer)'],
		['<check>', '—', 'Tap flips .value. Style the on state with check:checked. The checked attribute is ignored today; set screen.<id>.value = 1 in script to start checked'],
		['<radio>', 'name · value · checked', 'Same name = one group. checked picks the initial one'],
		['<select>', '<option value>…</option> children', 'Only id, class, style, hidden, value and the options are read. ref, on:*, bind:* and disabled are dropped — use ui.bind on screen.<id>.value instead'],
		['<range>', 'min · max · value', 'Default 0–100. Use screen.x.onChange(cb) or bind:value to react while dragging'],
		['<progress>', 'value', 'Clamped to 0–100'],
		['<input>', 'type="text|number" · placeholder · maxlength · keyboard', 'maxlength defaults to 16 and can\'t exceed 32. keyboard="<id>" picks a custom <keyboard>'],
	];

	const formsExample = `<view class="panel">
  <check id="fan">Fan enabled</check>

  <view class="row">
    <radio id="calm" name="speed" checked>Calm</radio>
    <radio id="fast" name="speed">Fast</radio>
  </view>

  <select id="mode">
    <option value="auto">Auto</option>
    <option value="heat">Heat</option>
    <option value="cool">Cool</option>
  </select>

  <label>Setpoint</label>
  <range id="setpoint" min="15" max="30" value="21"></range>
  <progress id="duty" value="40"></progress>

  <label>Device name</label>
  <input id="devName" type="text" placeholder="living-room" maxlength="20"/>

  <button id="save" on:click={save}>Save</button>
  <button id="reset" disabled>Reset</button>
</view>`;

	const richText = `<p style="width: 200px">
  This is <b>bold</b>, <i>italic</i>, <u>underlined</u>, and
  <span style="color: #ff6666">red</span>, with a <a href="#home">link home</a>.<br/>
  A hard break, then more wrapping text.
</p>

<ul>
  <li>prefixed with a bullet</li>
</ul>
<ol>
  <li>prefixed with "1. "</li>
</ol>`;

	const navExample = `<screen id="home">
  <h1>Home</h1>
  <button href="#settings">Settings ></button>
</screen>

<screen id="settings">
  <header class="screenHeader">
    <a href="#home">&lt; Back</a>
    <h2>Settings</h2>
  </header>
  <main class="scrollBody">
    <!-- taller than the display: drag to scroll -->
  </main>
</screen>`;

	const listExample = `<list id="log" item-height="22"></list>

<script>
  import { ui } from '@typecad/ui';
  ui.mount(screen);

  export const picked = ui.signal(-1);
  ui.bindList(
    screen.log,
    () => 40,                       // item count, polled every tick
    (i: number) => \`Entry \${i + 1}\`, // text for row i
    (i: number) => { picked.set(i); }, // optional: row tapped
  );
<\/script>`;

	const imgExample = `<img id="logo" src="logo.png"></img>
<img id="thumb" src="photo.jpg" style="width: 60px; height: 40px; object-fit: cover"></img>
<img id="icon" src="icon.svg" dither="floyd-steinberg"></img>`;

	const canvasExample = `<canvas id="spark" width="200" height="60"></canvas>

ui.drawCanvas(screen.spark, (ctx) => {
  ctx.fillScreen('#0a0a1a');
  ctx.hline(0, ctx.height / 2, ctx.width, '#2a4a6a');
  ctx.fillCircle(needleX, 20, 3, 'red');
  ctx.text(4, 12, 'temp', 'white');
});`;

	const canvasMethods = [
		['fillScreen(color)', 'Clear the whole canvas'],
		['drawPixel(x, y, color)', 'One pixel'],
		['fillRect · rect (x, y, w, h, color)', 'Filled / outlined rectangle'],
		['fillRoundRect · roundRect (x, y, w, h, r, color)', 'Rounded rectangle'],
		['line(x0, y0, x1, y1, color)', 'Any-angle line'],
		['hline(x, y, w, color) · vline(x, y, h, color)', 'Fast horizontal / vertical lines'],
		['fillCircle · circle (x, y, r, color)', 'Filled / outlined circle'],
		['rgbBitmap(x, y, data, w, h)', 'Blit a number[] of packed pixels'],
		['text(x, y, str, color?)', 'Stock bitmap font'],
		['width · height', 'Read-only buffer size'],
	];

	const keyboardExample = `<input id="msg" type="text" keyboard="kbAlpha" maxlength="32"/>

<!-- sibling of <screen>, not inside it -->
<keyboard id="kbAlpha" variant="alpha" class="ui-keyboard">
  <row><key>q</key><key>w</key><key>e</key><key>r</key><key>t</key><key>y</key></row>
  <row><key>a</key><key>s</key><key>d</key><key>f</key><key>g</key><key>h</key></row>
  <row><key special="1">⇧</key><key>z</key><key>x</key><key special="2">⌫</key></row>
  <row><key special="4">123</key><key> </key><key special="3">OK</key></row>
</keyboard>`;

	const specialKeys = [
		['special="1"', 'Shift (also inferred from ⇧ or SHIFT)'],
		['special="2"', 'Backspace (⌫ or BACKSPACE)'],
		['special="3"', 'OK / commit (OK)'],
		['special="4"', 'Swap page, alpha ↔ number (123 or ABC)'],
	];

	const overlayExample = `<button id="openBtn" class="btn btn-primary" on:click={openSheet}>Options</button>

<drawer id="sheet" side="bottom" class="card">
  <text class="card-title">Options</text>
  <button id="closeBtn" class="btn btn-outline btn-sm" on:click={closeSheet}>Close</button>
</drawer>

<dialog id="confirm">
  <view class="dialog-scrim" id="scrim" on:click={closeConfirm}></view>
  <view class="dialog-card">…</view>
</dialog>

<toast id="saved" side="bottom" duration="2200" class="toast">
  <text class="toast-title">Settings saved</text>
</toast>

<style>
  /* side= picks the slide direction; where it rests is up to you */
  #sheet { position: absolute; left: 6px; right: 6px; bottom: 6px; }
</style>

<script>
  export function openSheet()    { ui.drawer.open('sheet'); }
  export function closeSheet()   { ui.drawer.close('sheet'); }
  export function closeConfirm() { ui.dialog.close('confirm'); }
  export function save()         { ui.toast('saved'); }
<\/script>`;

	const overlays = [
		['<drawer side="bottom|top|left|right">', 'ui.drawer.open(id) · ui.drawer.close(id)', 'Slides in from that edge to wherever layout put it, so give it position: absolute and pin it to the edge. Closes on an outside tap and on navigation'],
		['<dialog>', 'ui.dialog.open(id) · ui.dialog.close(id)', 'Centered. Add your own scrim view and close it from its on:click. The kit\'s scrim is a solid near-black, since there\'s no alpha blending'],
		['<toast side duration="ms">', 'ui.toast(id)', 'Shows, then dismisses itself. duration defaults to 2500, minimum 500'],
	];

	const tableExample = `<table>
  <thead><tr><th>sensor</th><th>value</th></tr></thead>
  <tbody>
    <tr><td>temp</td><td>21.4 C</td></tr>
    <tr><td>humidity</td><td>44 %</td></tr>
  </tbody>
</table>`;
</script>

<svelte:head>
	<title>UI elements — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Every element a typeCAD/hal .ui screen understands: layout containers, text and rich text, form controls, lists, images, canvas, keyboards, drawers, dialogs, toasts, and multi-screen navigation."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🧱 UI elements</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	There are about fifteen native elements. Most HTML tags you'd reach for map onto them, so
	<code>&lt;div&gt;</code>, <code>&lt;p&gt;</code>, and <code>&lt;h1&gt;</code> work and pick up
	sensible default styles. Tags the compiler doesn't know become a <code>view</code> or a
	<code>text</code>, with a warning. This page covers every element, its attributes, and what
	<code>.value</code> means for each.
</p>

<ApiCard
	name="native elements"
	kind="reference"
	purpose="The element set the runtime actually draws. The last column is the type you get for `screen.<id>` in script."
	imports={'<screen> <view> <text> <button> …'}>
	{#snippet example()}
		<DocsTable headers={['Element', 'What it is', 'Handle type']} rows={native} monoCols={[0, 2]} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">HTML tags that map onto them</h3>
	<div class="mt-2"><DocsTable headers={['Becomes', 'HTML tags']} rows={aliases} monoCols={[0, 1]} /></div>
	<p class="mt-3 text-sm leading-relaxed">
		The original tag name is kept for CSS, so <code>h1 {'{ … }'}</code> and
		<code>p {'{ … }'}</code> selectors still match. Other <code>&lt;input&gt;</code> types
		(email, password…) fall back to a text field and warn <code>html-input-type-unsupported</code>.
		<code>svg</code>, <code>video</code>, <code>iframe</code> and friends render as empty
		containers and warn <code>unsupported-html-tag</code>. <code>head</code>, <code>meta</code>,
		<code>title</code>, and <code>link</code> are skipped silently.
	</p>
</ApiCard>

<ApiCard
	name="common attributes"
	kind="reference"
	purpose={"Attributes that work on any element. Attribute values are plain strings — there's no `class={…}` or `style={…}` interpolation."}
	imports={'id · ref · class · style · hidden · disabled · href'}>
	{#snippet example()}
		<DocsTable headers={['Attribute', 'What it does']} rows={attrs} monoCols={[0]} />
	{/snippet}
	<Callout>
		Give anything you'll touch from script an <code>id</code>. Ids are global across all the
		screens in a file. If two screens both want <code>id="btn"</code>, give each
		<code>&lt;screen&gt;</code> an id and reach them through
		<code>screen.groups.home.btn</code> and <code>screen.groups.forms.btn</code>. Grouped handles
		work for <code>onClick</code> today. Other methods and <code>.value</code> want the flat
		<code>screen.&lt;id&gt;</code> form.
	</Callout>
</ApiCard>

<ApiCard
	name="📄 screens & navigation"
	kind="structure"
	purpose="A file can hold several `<screen>` roots. Navigation is markup: an `href=&quot;#id&quot;` on an `<a>` or `<button>`."
	imports={'<screen id> · href="#screenId"'}>
	{#snippet example()}
		<CodeBlock code={navExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/navigation.png', alt: 'A settings screen: header with a Back link, then a scrolling column of items with a scrollbar on the right' }]} caption="the settings screen: header plus a .scrollBody taller than the display" />
	<ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>The first <code>&lt;screen&gt;</code> in the file is the one that shows at boot.</li>
		<li>
			Navigating closes the keyboard, open selects, and drawers, resets scroll, and frees
			canvas buffers. Then it draws the new screen off-screen and swaps it in. There are no
			transition animations between screens.
		</li>
		<li>
			There's no <code>ui.navigate()</code> in script yet, so screen changes come from a tap
			on an <code>href</code>.
		</li>
		<li>
			<code>&lt;body&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, and
			<code>&lt;footer&gt;</code> are views. <code>body</code> gets <code>flex: 1</code>, so a
			header/main/footer layout fills the screen.
		</li>
	</ul>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Scrolling</h3>
	<p class="mt-2 text-sm leading-relaxed">
		Any container with <code>overflow: scroll</code> (or <code>hidden</code>) scrolls
		vertically when dragged. The <code>.scrollBody</code> class does this for you, and so does
		<code>&lt;list&gt;</code>. Dragging is 1:1 with a rubber-band edge and a snap on release.
		There's no fling. <code>overflow: scroll</code> reserves 8 px on the right for the
		scrollbar. You can tune the feel with <code>display.scroll</code> in the config
		(<code>maxOverscroll</code>, <code>stiffness</code>, <code>edgeSnapPx</code>,
		<code>dragScale</code>).
	</p>
</ApiCard>

<ApiCard
	name="🔤 text & rich text"
	kind="elements"
	purpose="`<text>`, `<p>`, `<span>`, headings and the rest all become text nodes. Mixed inline tags inside one of them flow as rich text on shared, wrapped lines."
	imports={'<p> <b> <i> <u> <span> <a> <br>'}>
	{#snippet example()}
		<CodeBlock code={richText} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/richtext.png', alt: 'A paragraph mixing bold, italic, underlined, red and link runs, then a bulleted and a numbered list item' }]} caption="italic here comes from an @font-face — the bundled faces are regular and bold" />
	<ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>
			Inline tags: <code>span</code>, <code>a</code>, <code>b</code>/<code>strong</code>,
			<code>i</code>/<code>em</code>, <code>u</code>, <code>code</code>, <code>kbd</code>,
			<code>samp</code>, <code>br</code>. Each run takes its own color, size, weight, and
			decoration. An inline <code>&lt;a href="#id"&gt;</code> is tappable.
		</li>
		<li>
			Inline runs match CSS by their own tag or class only. Descendant selectors, ids, and
			attribute selectors don't reach them.
		</li>
		<li>
			Rich text is static. A paragraph with inline runs can't also carry a
			<code>{'{expr}'}</code> or a text binding (<code>run-text-binding-conflict</code>). Put
			the live part in its own <code>&lt;text&gt;</code>.
		</li>
		<li><code>&lt;li&gt;</code> gets a "• " prefix under <code>ul</code>, and "1. ", "2. "… under <code>ol</code>.</li>
		<li>
			Text that changes at runtime (bindings, <code>{'{expr}'}</code>, inputs, list rows) is
			capped at 32 characters by the runtime's text buffer. Static text has no limit.
		</li>
	</ul>
</ApiCard>

<ApiCard
	name="🎛️ form controls"
	kind="elements"
	purpose="Every control has a numeric `.value` you can read and write from script. Taps are wired for you: checks toggle, radios group, selects open a picker, ranges drag."
	imports={'<button> <check> <radio> <select> <range> <progress> <input>'}>
	{#snippet example()}
		<CodeBlock code={formsExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/forms.png', alt: 'Form controls: a checked checkbox, two radios, a select showing Auto, a slider, a progress bar, a text input, and Save / Reset buttons', label: 'default UA styles' }, { src: '/hal/ui/select-open.png', alt: 'The same form with the select open, listing Auto, Heat and Cool', label: 'after tapping the select' }]} caption="no stylesheet beyond a little spacing" />
	<DocsTable headers={['Element', 'Attributes', 'Behavior']} rows={controls} monoCols={[0, 1]} />
	<Callout>
		<code>&lt;select&gt;</code>, <code>&lt;list&gt;</code>, and <code>&lt;input&gt;</code> need
		touch. On a display without a touch controller, the build warns
		<code>ui-interactive-no-touch</code>. Drive them from GPIO buttons instead (see
		<a class="underline" href="/hal/docs/ui-reactivity">Reactivity &amp; events</a>).
	</Callout>
</ApiCard>

<ApiCard
	name="⌨️ input & keyboards"
	kind="elements"
	purpose="Tapping an `<input>` opens an on-screen keyboard. There's a built-in alpha and number layout, or you can declare your own."
	imports={'<keyboard> <row> <key>'}>
	{#snippet example()}
		<CodeBlock code={keyboardExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/keyboard.png', alt: 'The built-in alpha keyboard docked over the bottom of the screen after tapping an input' }]} caption="the built-in alpha keyboard, unstyled" />
	<DocsTable headers={['Key attribute', 'Meaning']} rows={specialKeys} monoCols={[0]} />
	<ul class="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>
			A <code>&lt;keyboard&gt;</code> lives next to <code>&lt;screen&gt;</code>, not inside it.
			An input uses it when it says <code>keyboard="&lt;id&gt;"</code>, otherwise it gets the
			default for its <code>type</code>.
		</li>
		<li>
			Keys are single ASCII characters. Anything else (multi-byte, multi-character) becomes a
			space, with a warning. Up to 48 keys per keyboard.
		</li>
		<li>
			Style keys with <code>.ui-keyboard</code>, <code>.ui-key</code>,
			<code>.ui-key-ok</code>, <code>.ui-key-del</code>, and <code>.ui-key-page</code>. Key
			colors only resolve from single-class selectors.
		</li>
		<li>On the desktop (SDL) target the physical keyboard types, and the on-screen grid isn't drawn.</li>
	</ul>
</ApiCard>

<ApiCard
	name="📜 lists"
	kind="element"
	purpose="`<list>` is a virtualized, scrollable list. Only the visible rows are drawn, so 40 rows or 4,000 cost the same RAM."
	imports={'<list item-height> + ui.bindList'}>
	{#snippet example()}
		<CodeBlock code={listExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/list.png', alt: 'A bordered list showing Entry 1 to Entry 8 with a scrollbar' }]} />
	<p class="text-sm leading-relaxed">
		<code>item-height</code> defaults to 24. The count function runs every tick, and a changed
		count refreshes the list. Rows are single-line strings, capped at 32 characters like other
		dynamic text.
	</p>
</ApiCard>

<ApiCard
	name="🖼️ images"
	kind="element"
	purpose="`<img>` sources are decoded and converted at build time to the panel's pixel format. Nothing is decoded on the device."
	imports={'<img id src>'}>
	{#snippet example()}
		<CodeBlock code={imgExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/images.png', alt: 'An SVG badge whose transparent corners turned black, then one image three ways: fill, contain, and cover' }]} caption="an SVG with transparent corners (flattened onto black), then object-fit fill / contain / cover" />
	<ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>PNG, JPEG, GIF, BMP, WebP, AVIF, TIFF, SVG, and ICO all work. Paths are relative to the UI file.</li>
		<li>
			Transparency is flattened onto black, so put a background behind icons that need one.
		</li>
		<li>
			Images use their natural size unless you set <code>width</code>/<code>height</code>.
			Then <code>object-fit</code> applies: <code>fill</code> (default), <code>contain</code>,
			<code>cover</code>, <code>scale-down</code>, or <code>none</code>.
		</li>
		<li>
			On 1-bit displays, <code>dither="threshold"</code> (default) or
			<code>dither="floyd-steinberg"</code> picks the conversion.
		</li>
		<li>
			A file the decoder doesn't recognize is read as raw little-endian RGB565 and needs
			<code>width</code>/<code>height</code> attributes (default 32×32).
		</li>
		<li><code>&lt;img&gt;</code> needs an <code>id</code>, because assets are keyed by it. Without one it renders empty.</li>
	</ul>
</ApiCard>

<ApiCard
	name="🎨 canvas"
	kind="element"
	purpose="When markup isn't the right tool (a sparkline, a gauge needle), `<canvas>` gives you a pixel buffer and a draw callback that runs every frame."
	imports={'<canvas width height> + ui.drawCanvas'}>
	{#snippet example()}
		<CodeBlock code={canvasExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/canvas.png', alt: 'A dark canvas with a green line graph, a red dot, a blue rounded rectangle and the label temp' }]} />
	<DocsTable headers={['ctx member', 'What it draws']} rows={canvasMethods} monoCols={[0]} />
	<p class="mt-3 text-sm leading-relaxed">
		Coordinates are canvas-relative and clipped to the buffer. Color arguments are CSS color
		strings resolved at build time, so a color computed at runtime won't work. The callback
		should only draw: other side effects are rejected. Unknown <code>ctx</code> methods are a
		<code>ui-canvas-method</code> error. The buffer costs width × height × bytes-per-pixel of
		RAM, so keep it small.
	</p>
</ApiCard>

<ApiCard
	name="drawers, dialogs & toasts"
	kind="elements"
	purpose="Overlays declared in markup and opened from script by id."
	imports={'<drawer> <dialog> <toast>'}>
	{#snippet example()}
		<CodeBlock code={overlayExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/drawer.png', alt: 'A drawer card sitting at the bottom of the screen with a Close button', label: 'ui.drawer.open' }, { src: '/hal/ui/dialog.png', alt: 'A centered confirm dialog over a dark scrim', label: 'ui.dialog.open' }, { src: '/hal/ui/toast.png', alt: 'A dark toast reading Settings saved along the bottom edge', label: 'ui.toast' }]} />
	<DocsTable headers={['Element', 'Script', 'Behavior']} rows={overlays} monoCols={[0, 1]} />
	<Callout>
		<code>ui.drawer</code>, <code>ui.dialog</code>, and <code>ui.toast</code> are handled by
		the transpiler but aren't in <code>@typecad/ui</code>'s type definitions yet, so your editor
		may underline them. The build is fine. Pass a literal id string, because an unknown id is a
		build error.
	</Callout>
</ApiCard>

<ApiCard
	name="tables"
	kind="elements"
	purpose="Tables render as flex rows of equal-width cells. That covers sensor readouts and settings pages, but it isn't the HTML table algorithm."
	imports={'<table> <tr> <th> <td>'}>
	{#snippet example()}
		<CodeBlock code={tableExample} label="app.ui" />
	{/snippet}
	<UiShot shots={[{ src: '/hal/ui/table.png', alt: 'A two-column table with a grey header row: sensor and value' }]} />
	<p class="text-sm leading-relaxed">
		<code>colspan</code> and <code>rowspan</code> aren't supported
		(<code>html-table-span-unsupported</code>). Give a cell a <code>flex</code> value if one
		column should be wider.
	</p>
</ApiCard>

<p class="mt-10 text-sm leading-relaxed text-muted-foreground">
	Next: <a class="underline" href="/hal/docs/ui-reactivity">Reactivity &amp; events</a> to make
	these elements do something, or <a class="underline" href="/hal/docs/ui-styling">Styling</a>
	to make them look like something.
</p>
