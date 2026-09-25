<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const keyboardExample = `import { Keyboard, KEY } from '@typecad/hal';

const kb = new Keyboard();
kb.begin();                 // register the descriptor, start the USB stack

kb.press(KEY.CTRL);
kb.press(KEY.SHIFT);
kb.press(KEY.ESC);          // Ctrl+Shift+Esc
kb.releaseAll();            // clean slate — zeroes the whole report`;

	const keyboardHold = `kb.press(KEY.GUI);          // hold the modifier...
kb.press(KEY.D);            // ...while pressing D
kb.release(KEY.D);
kb.release(KEY.GUI);        // modifiers release like any other key`;

	const mouseExample = `import { Mouse, MOUSE } from '@typecad/hal';

const mouse = new Mouse();
mouse.begin();

mouse.move(10, -4);         // relative — right 10, up 4
mouse.move(0, 0, 1);        // third argument: one wheel step
mouse.click(MOUSE.LEFT);    // press + release as two reports

mouse.press(MOUSE.LEFT | MOUSE.RIGHT);   // buttons OR together
mouse.release(MOUSE.LEFT | MOUSE.RIGHT);`;

	const keyGroups = [
		['Letters', 'KEY.A – KEY.Z'],
		['Digits', 'KEY.N0 – KEY.N9'],
		['Modifiers', 'KEY.CTRL · KEY.SHIFT · KEY.ALT · KEY.GUI'],
		['Control', 'ENTER · ESC · BACKSPACE · TAB · SPACE · CAPSLOCK'],
		['Navigation', 'RIGHT · LEFT · DOWN · UP · HOME · END · PAGEUP · PAGEDOWN · INSERT · DEL'],
		['Function', 'KEY.F1 – KEY.F12'],
		['Punctuation', 'MINUS · EQUAL · LEFTBRACE · RIGHTBRACE · BACKSLASH · SEMICOLON · APOSTROPHE · GRAVE · COMMA · DOT · SLASH'],
		['System', 'PRINTSCREEN · SCROLLLOCK · PAUSE']
	];
</script>

<svelte:head>
	<title>USB HID — Keyboard &amp; Mouse — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Make the board a USB keyboard or mouse: KEY.*/MOUSE.* tokens lower to boot-protocol HID reports over Zephyr's USB device stack — hardware tested end to end."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">USB HID — Keyboard &amp; Mouse</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The board becomes a USB input device: <code>Keyboard</code> and <code>Mouse</code> speak the
	boot-protocol HID reports a host already understands, so no drivers are needed — plug in and it
	types and moves. Every verb here is <strong>hardware-tested</strong> on a real board; the
	examples are the tests.
</p>

<ApiCard
	name="Keyboard"
	kind="class"
	purpose="A boot-protocol keyboard: an 8-byte report — one modifier byte plus six concurrent key
		slots. press/release submit one report each; modifiers OR into the modifier byte, keys fill
		slots in press order."
	imports={"import { Keyboard, KEY } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={keyboardExample} label="keyboard.ts" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Chords, not just releases</h3>
	<p class="text-sm leading-relaxed">
		Modifiers are keys — hold one with <code>press</code>, layer the chord, then release in any
		order:
	</p>
	<CodeBlock code={keyboardHold} label="chord.ts" class="mt-2" />
	<DocsTable
		headers={['Method', 'What it does']}
		rows={[
			['begin()', 'Registers the boot-keyboard descriptor and starts the USB device stack — once, before any press'],
			['press(key)', 'Modifier → OR into the modifier byte; key → first free slot'],
			['release(key)', 'Release a key or modifier'],
			['releaseAll()', 'Zero the whole report — every slot and modifier']
		]}
		monoCols={[0]} />
</ApiCard>

<ApiCard
	name="Mouse"
	kind="class"
	purpose="A boot-protocol mouse: relative movement and up to three buttons. x/y clamp to
		±127 per report — int8 is the wire format, so an oversized move saturates instead of
		producing a malformed report. The wheel rolls in y."
	imports={"import { Mouse, MOUSE } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={mouseExample} label="mouse.ts" />
	{/snippet}
	<DocsTable
		headers={['Method', 'What it does']}
		rows={[
			['begin()', 'Registers the boot-mouse descriptor and starts the USB device stack'],
			['move(dx, dy, wheel?)', 'Relative motion, clamped to ±127 per report; wheel defaults to 0'],
			['press(button) / release(button)', 'Hold and let go — MOUSE.LEFT · RIGHT · MIDDLE, OR-able'],
			['click(button)', 'Press and release as two reports']
		]}
		monoCols={[0]} />
</ApiCard>

<ApiCard
	name="KEY / MOUSE tokens"
	kind="token tables"
	purpose="Key and button arguments are tokens, not magic numbers — each maps name-for-name onto
		Zephyr's HID_KEY_* usage codes, and the transpiler splices them into the generated reports."
	imports={"import { KEY, MOUSE } from '@typecad/hal'"}>
	{#snippet example()}
		<DocsTable headers={['Group', 'Tokens']} rows={keyGroups} monoCols={[0]} />
	{/snippet}
	<Callout>
		<code>MOUSE.LEFT | RIGHT | MIDDLE</code> is a bitmask — combine buttons with
		<code>|</code> wherever a button is expected.
	</Callout>
</ApiCard>

<Callout label="One HID interface per program">
	A board exposes one <code>zephyr,hid-device</code> node, so a program is a keyboard
	<em>or</em> a mouse — not both at once (the same v1 ceiling as the nRF PWM matrix). The
	hardware test suites are two separate files for exactly this reason: each is its own app.
</Callout>

<Callout label="Board-gated, like all hardware">
	<code>Keyboard</code> and <code>Mouse</code> only exist on boards whose devicetree enables a
	USB device controller — importing them anywhere else fails at module resolution. See
	<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards &amp; Targets</a>.
	Using HID in a project also emits the right build facts automatically
	(<code>CONFIG_USB_DEVICE_STACK_NEXT</code>, <code>CONFIG_USBD_HID_SUPPORT</code>) — nothing to
	configure by hand.
</Callout>
