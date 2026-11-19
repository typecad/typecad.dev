<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const signalExample = `export const count = ui.signal(0);      // Signal<number>  → int
export const temp  = ui.signal(21.5);   // Signal<number>  → double
export const label = ui.signal('idle'); // Signal<string>  → const char*
export const armed = ui.signal(false);  // Signal<boolean> → bool

count.set(count() + 1);  // read by calling, write with .set()`;

	const interpExample = `<text id="taps">taps: {count}</text>
<text id="pct">{level}% full</text>
<text id="pos">x:{x} y:{y}</text>`;

	const bindTextExample = `// strings, doubles, and conditional text go through ui.bind
ui.bind(screen.status, 'text', () => \`state: \${label()}\`);
ui.bind(screen.tempText, 'text', () => \`\${temp()} C\`);
ui.bind(screen.mode, 'text', () =>
  screen.modeSel.value == 0 ? 'auto' : screen.modeSel.value == 1 ? 'heat' : 'cool');

// colors, visibility, and values
ui.bind(screen.lamp, 'background', () => armed() ? '#29d391' : '#4b5563');
ui.bind(screen.alarmBanner, 'visible', () => temp() > 30);
ui.bind(screen.meter, 'value', () => screen.volume.value * 10);`;

	const bindProps = [
		['text', 'A string. See the accepted shapes below'],
		['background', 'A CSS color. Conditional colors are fine; each branch is resolved at build time'],
		['color', 'Text color'],
		['borderColor', 'Border color'],
		['visible', 'A boolean. Hidden nodes keep their space'],
		['value', 'A number, written to the node\'s .value (progress fill, range position, check state)'],
	];

	const textShapes = [
		['`temp: ${t()} C`', 'Template literal. Each signal or variable span uses its own type: %d for int/bool, %g for double, %s for strings'],
		["cond ? 'on' : 'off'", 'Ternary chain whose branches are string literals'],
		['String(x)', 'One value, formatted by type'],
		["'fixed'", 'A string literal'],
		["screen.name.text || 'unnamed'", 'A string with a fallback'],
		['{ …; return `…`; }', 'Block body, as long as it ends in a return of one of the above'],
	];

	const directives = [
		['on:click={fn}', 'Short tap (under 600 ms)'],
		['on:hold={fn}', 'Long press (600 ms or more)'],
		['on:release={fn}', 'Finger lifted off the element'],
		['on:change={fn}', '<input>: after the keyboard commits'],
		['bind:text={sig}', '<input>: shows the string signal and writes commits back into it'],
		['bind:value={sig}', '<check>, <range>: shows the signal and writes taps or drags back into it'],
	];

	const handleExample = `// read and write element state from anywhere
if (screen.fan.value == 1) { /* checked */ }
screen.duty.value = 75;           // progress bar to 75%
screen.devName.text = 'pump-02';  // input / text contents

// touch events
screen.save.onClick(() => { saves.set(saves() + 1); });
screen.save.onHold(factoryReset);
screen.volume.onChange(() => { level.set(screen.volume.value); }); // range: fires while dragging
screen.devName.onChange(() => { name.set(screen.devName.text); }); // input: on commit`;

	const threadExample = `import { Thread, Time } from '@typecad/hal';

const poll = new Thread(0, { stackKb: 2 });
poll.start((): void => {
  while (true) {
    temp.set(sensor.readTemperature());
    screen.duty.value = (screen.duty.value + 5) % 105;
    Time.sleep(500);
  }
});`;

	const gpioExample = `// a physical button flips a checkbox
screen.fan.onToggle(4);

// a rotary-style button cycles a select through 3 options
screen.mode.onChange(5, 3, () => { applyMode(screen.mode.value); });

// a button shows :pressed while held
screen.fire.onPress(6);

// or just run code on a falling edge
ui.watchPin(7, () => { count.set(count() + 1); });`;

	const tapExample = `async function screensaver() {
  while (true) {
    Time.sleep(30000);
    backlight.write(0);
    await ui.onTap();          // any tap, anywhere
    backlight.write(1);
  }
}

async function wizard() {
  await ui.onTap(screen.next); // only this button
  step.set(2);
  await ui.onTap(screen.next);
  step.set(3);
}`;

	const callbackRules = [
		['Allowed', 'const/let, if/else, for, while, do/while, break/continue, signal reads and .set(), element .value/.text, calls to your own functions'],
		['Callback shape', 'An inline arrow/function, or the name of a top-level function'],
		['Errors', 'ui-callback-unsupported-statement · ui-callback-unsupported-arg · ui-callback-unresolved-name'],
	];

	const diagnostics = [
		['ui-signal-initializer', 'warning', 'ui.signal() got something other than a number/string/boolean literal. It becomes an int 0'],
		['ui-unknown-element', 'error', 'screen.<id> doesn\'t match any element. Usually a typo'],
		['ui-bind-text-unlowered', 'error', 'A text binding in a shape the compiler can\'t turn into a format string'],
		['ui-bind-unlowered', 'error', 'A block-bodied binding with no final return'],
		['run-text-binding-conflict', 'error', 'A text binding on a rich-text run'],
		['ui-canvas-method', 'error', 'Unknown ctx method inside ui.drawCanvas'],
		['ui-ontap-arg', 'error', 'ui.onTap() given something that isn\'t an element handle'],
		['ui-mount-no-display-config', 'error', 'ui.mount() with no display block in the config'],
	];
</script>

<svelte:head>
	<title>UI reactivity & events — typeCAD/hal docs</title>
	<meta
		name="description"
		content="How typeCAD/hal UIs stay live: signals, {'{expr}'} interpolation, on: and bind: directives, ui.bind, element handles, GPIO buttons, threads, and awaitable taps."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">⚡ UI reactivity &amp; events</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The model is simple. Every frame, the runtime evaluates each binding, compares it to what's
	on screen, and repaints what changed. Signals are plain C++ variables. There's no dependency
	graph and no subscription bookkeeping. The upside is that anything a binding reads (a signal,
	an element's <code>.value</code>, a global) updates the screen when it changes. The cost is
	that every binding runs every tick, so keep them cheap.
</p>

<ApiCard
	name="ui.signal"
	kind="function"
	purpose="Declare a piece of state the screen shows. Lowers to a plain device variable of the matching C++ type."
	imports={"import { ui } from '@typecad/ui'"}>
	{#snippet example()}
		<CodeBlock code={signalExample} label="app.ui <script>" />
	{/snippet}
	<MethodDoc name="signal" signature="ui.signal(initial: number | string | boolean)" returns="Signal<T>">
		<p class="mt-2 text-sm leading-relaxed">
			Pass a literal, because the literal sets the C++ type. A whole number gives an
			<code>int</code> and anything with a fraction (<code>21.5</code>) gives a
			<code>double</code>.
			Objects, arrays, and computed initial values aren't allowed. Export the signal if markup
			uses it in a <code>.ui</code> file.
		</p>
	</MethodDoc>
	<Callout>
		The type comes from the literal's value, not how it's spelled. <code>0</code> and
		<code>0.0</code> are both <code>int</code>. If a signal will hold decimals, start it at a
		non-integer value (a plausible reading like <code>21.5</code>). Otherwise the fraction is
		dropped before it reaches the screen.
	</Callout>
</ApiCard>

<ApiCard
	name="{'{expr}'} in text"
	kind="template"
	purpose="Braces in text content become a live binding. They're the quickest way to put a number on screen."
	imports={'<text>taps: {count}</text>'}>
	{#snippet example()}
		<CodeBlock code={interpExample} label="app.ui" />
	{/snippet}
	<ul class="list-disc space-y-1 pl-5 text-sm leading-relaxed">
		<li>
			Write the bare name, <code>{'{count}'}</code>, not <code>{'{count()}'}</code>. The
			expression is pasted into the generated C++ as-is.
		</li>
		<li>
			<strong>Markup interpolation is integer-only.</strong> Every <code>{'{…}'}</code> formats
			as <code>%d</code>. A string or double signal in braces prints the wrong thing. For those,
			use <code>ui.bind(…, 'text', …)</code> with a template literal (below), which formats by
			type.
		</li>
		<li>Interpolation works in text content only. Attributes don't interpolate.</li>
		<li>There's no <code>{'{#if}'}</code> or <code>{'{#each}'}</code>. Use a <code>visible</code> binding for conditionals and <code>&lt;list&gt;</code> for repeats.</li>
		<li>The rendered string is capped at 32 characters.</li>
	</ul>
</ApiCard>

<ApiCard
	name="on: and bind:"
	kind="directives"
	purpose="Event and two-way attributes in markup. Each one takes a name (a function or a signal), not an inline expression."
	imports={'on:click={fn} · bind:value={sig}'}>
	{#snippet example()}
		<DocsTable headers={['Directive', 'When / what']} rows={directives} monoCols={[0]} />
	{/snippet}
	<CodeBlock
		code={`<button id="save" on:click={save}>Save</button>
<input id="ssid" bind:text={ssid}/>
<range id="vol" bind:value={volume}></range>

<script>
  export const ssid = ui.signal('');
  export const volume = ui.signal(50);
  export function save() { /* … */ }
<\/script>`}
		label="app.ui" />
	<Callout>
		<code>on:change</code> on a <code>&lt;range&gt;</code> is wired to keyboard commits, so it
		won't fire while you drag. Use <code>bind:value</code> or
		<code>screen.&lt;id&gt;.onChange(cb)</code> for sliders. <code>&lt;select&gt;</code> drops
		<code>on:</code> and <code>bind:</code> attributes. Read
		<code>screen.&lt;id&gt;.value</code> in a <code>ui.bind</code> instead.
	</Callout>
</ApiCard>

<ApiCard
	name="ui.bind"
	kind="function"
	purpose="Bind one property of a node to a function of anything. Re-evaluated every tick, and repainted only when the result changes."
	imports={'ui.bind(node, prop, () => …)'}>
	{#snippet example()}
		<CodeBlock code={bindTextExample} label="app.ui <script>" />
	{/snippet}
	<DocsTable headers={['Property', 'Expects']} rows={bindProps} monoCols={[0]} />
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Text bindings: what the compiler accepts</h3>
	<div class="mt-2"><DocsTable headers={['Shape', 'Notes']} rows={textShapes} monoCols={[0]} /></div>
	<p class="mt-3 text-sm leading-relaxed">
		Compound expressions inside a template span (<code>{'${a * 2}'}</code>,
		<code>{'${Math.floor(t)}'}</code>) format as integers. If you need a computed decimal, put
		it in a double signal first and interpolate the signal. Any other property name is a build
		error. You can't bind padding, size, or position, because layout is fixed at build time.
	</p>
</ApiCard>

<ApiCard
	name="element handles"
	kind="objects"
	purpose="Every element with an id is `screen.<id>`. Reading `.value` or `.text` reads the live node, and writing marks it dirty for the next frame."
	imports={'screen.<id>.value · .text · .onClick(…)'}>
	{#snippet example()}
		<CodeBlock code={handleExample} label="app.ui <script>" />
	{/snippet}
	<MethodDoc name=".value" signature="number (read/write)">
		<p class="mt-2 text-sm leading-relaxed">
			check/radio: 0 or 1 · select: option index · range: min..max · progress: 0–100 · button:
			1 while pressed. Writes are clamped where the element has a range.
		</p>
	</MethodDoc>
	<MethodDoc name=".text" signature="string (read/write)">
		<p class="mt-2 text-sm leading-relaxed">
			The contents of an <code>&lt;input&gt;</code> or text node, up to 32 characters.
		</p>
	</MethodDoc>
	<MethodDoc name="touch events" signature="onClick(cb) · onHold(cb) · onRelease(cb) · onChange(cb)">
		<p class="mt-2 text-sm leading-relaxed">
			<code>onChange(cb)</code> fires during a drag on a <code>&lt;range&gt;</code>, and on
			commit for an <code>&lt;input&gt;</code>. A tap fires the element's
			<code>onClick</code> and also resumes any <code>await ui.onTap()</code>.
		</p>
	</MethodDoc>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Callbacks</h3>
	<div class="mt-2"><DocsTable headers={['Rule', 'Detail']} rows={callbackRules} monoCols={[]} /></div>
	<Callout>
		On the device, <code>onRelease(cb)</code> with a callback is currently matched by the GPIO
		overload, <code>onRelease(pin)</code>, so the callback isn't wired as a touch handler. The
		preview behaves differently. Until that's fixed, use <code>on:release={'{fn}'}</code> in
		markup for touch release.
	</Callout>
</ApiCard>

<ApiCard
	name="🧵 updating from threads"
	kind="pattern"
	purpose="Sensors and timers usually live in a Thread. Write signals or element values from it; the UI tick picks the change up on its next pass."
	imports={"import { Thread } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={threadExample} label="app.ui <script>" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The UI reads state once per tick, so a value that changes several times between frames
		only shows the last one. That's usually what you want for readouts.
	</p>
</ApiCard>

<ApiCard
	name="🔘 physical buttons"
	kind="functions"
	purpose="For panels without touch, or alongside it. Pins are polled from the async pump about every 20 ms. There are no ISRs, and the poll interval does the debouncing."
	imports={'onToggle · onChange(pin, n) · onPress · ui.watchPin'}>
	{#snippet example()}
		<CodeBlock code={gpioExample} label="app.ui <script>" />
	{/snippet}
	<MethodDoc name="onToggle" signature="screen.x.onToggle(pin, cb?)">
		<p class="mt-2 text-sm leading-relaxed">Falling edge flips <code>.value</code> between 0 and 1, then runs <code>cb</code>.</p>
	</MethodDoc>
	<MethodDoc name="onChange" signature="screen.x.onChange(pin, optionCount, cb?)">
		<p class="mt-2 text-sm leading-relaxed">Falling edge steps <code>.value</code> through 0..optionCount-1 and wraps.</p>
	</MethodDoc>
	<MethodDoc name="onPress / onRelease" signature="screen.x.onPress(pin) · screen.x.onRelease(pin)">
		<p class="mt-2 text-sm leading-relaxed">Drives the element's <code>:pressed</code> style from a pin, so a hardware button looks pressed on screen.</p>
	</MethodDoc>
	<MethodDoc name="watchPin" signature="ui.watchPin(pin, onFalling)">
		<p class="mt-2 text-sm leading-relaxed">Runs a callback on a falling edge. It's safe to write signals inside it.</p>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="await ui.onTap"
	kind="function"
	purpose="Awaitable taps, so multi-step flows read top to bottom instead of becoming a state machine."
	imports={'await ui.onTap(node?)'}>
	{#snippet example()}
		<CodeBlock code={tapExample} label="app.ui <script>" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Use it inside an <code>async</code> function. With no argument it resumes on any tap,
		including empty space. With an element, it waits for that element. It resolves to nothing,
		so there's no value to read from it.
	</p>
</ApiCard>

<ApiCard
	name="the rest of the ui API"
	kind="functions"
	purpose="Calls covered on the Elements page, plus mount and window controls."
	imports={"import { ui } from '@typecad/ui'"}>
	{#snippet example()}
		<DocsTable
			headers={['Call', 'What it does']}
			rows={[
				['ui.mount(screen, opts?)', 'Initialize the display and draw the first frame. Keep wiring in the config; opts (display, cs, dc, rst, rotation, backlight, spiFrequency, address, reset) are overrides'],
				['ui.bindList(list, count, item, onTap?)', 'Feed a virtualized <list>'],
				['ui.bindInput(input, (text) => …)', 'Run a callback when an input\'s text changes'],
				['ui.drawCanvas(canvas, (ctx) => …)', 'Per-frame drawing into a <canvas>'],
				["ui.drawer.open/close(id) · ui.dialog.open/close(id) · ui.toast(id)", 'Overlays (not in the type definitions yet)'],
				['ui.window.setTitle(str)', 'Desktop (SDL) window title. Does nothing on hardware'],
				['ui.window.setIcon(path)', 'Not implemented at runtime. Use display.icon in the config instead'],
			]}
			monoCols={[0]} />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Details and examples for lists, inputs, canvases, and overlays are on the
		<a class="underline" href="/hal/docs/ui-elements">Elements</a> page.
	</p>
</ApiCard>

<ApiCard
	name="diagnostics you'll see"
	kind="reference"
	purpose="Build messages from the reactive side, and what usually causes them."
	imports={'typecad-hal build'}>
	{#snippet example()}
		<DocsTable headers={['Code', 'Severity', 'Usual cause']} rows={diagnostics} monoCols={[0, 1]} />
	{/snippet}
</ApiCard>

<p class="mt-10 text-sm leading-relaxed text-muted-foreground">
	Next: <a class="underline" href="/hal/docs/ui-styling">Styling</a>. If a binding doesn't do
	what this page says, open an issue on
	<a class="underline" href="https://github.com/typecad">github.com/typecad</a> with the
	snippet.
</p>
