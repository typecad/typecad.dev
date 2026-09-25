<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const gpioExample = `import { GPIO, LED, BUTTON } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT | GPIO.OUTPUT_INIT_LOW);
const button = new GPIO(BUTTON, GPIO.INPUT | GPIO.PULL_UP);

led.set(true);          // drive the pin
if (button.get()) {     // read it
  led.toggle();         // atomic toggle
}`;

	const pinExample = `import { LED, BUTTON, PB5, GPIO } from '@typecad/hal';

new GPIO(LED, GPIO.OUTPUT);     // board export
new GPIO(5, GPIO.OUTPUT);       // raw number
new GPIO(PB5, GPIO.OUTPUT);     // Pin instance`;

	const interruptExample = `button.onInterrupt(GPIO.INT_EDGE_FALLING, () => { pressed = true; });
// ...
button.offInterrupt();`;

	const flags = [
		['GPIO.INPUT / GPIO.OUTPUT', 'GPIO_INPUT / GPIO_OUTPUT', 'Direction'],
		[
			'GPIO.OUTPUT_INIT_LOW / GPIO.OUTPUT_INIT_HIGH',
			'GPIO_OUTPUT_INIT_LOW / GPIO_OUTPUT_INIT_HIGH',
			"Output's initial level, set atomically — no configure-then-write glitch"
		],
		['GPIO.PULL_UP / GPIO.PULL_DOWN', 'GPIO_PULL_UP / GPIO_PULL_DOWN', 'Internal bias'],
		['GPIO.OPEN_DRAIN / GPIO.OPEN_SOURCE', 'GPIO_OPEN_DRAIN / GPIO_OPEN_SOURCE', 'Output topology (bus pins like I2C SDA)'],
		['GPIO.DISCONNECTED', 'GPIO_DISCONNECTED', 'Both buffers off']
	];

	const gpioMethods = [
		['set', 'set(value: boolean): void', 'Drive the pin (logical level)'],
		['get', 'get(): boolean', 'Read the logical level'],
		['toggle', 'toggle(): void', 'Toggle the pin'],
		['onInterrupt', 'onInterrupt(token, handler): void', 'Attach edge/level interrupt'],
		['offInterrupt', 'offInterrupt(): void', 'Detach the interrupt']
	];
</script>

<svelte:head>
	<title>GPIO &amp; Digital I/O — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Digital pins as one small class: construction carries the configuration — set, get, toggle, and interrupts."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">GPIO &amp; Digital I/O</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Digital pins use one small class: <code>new GPIO(pin, flags)</code> configures the pin, and
	<code>set</code>, <code>get</code>, and <code>toggle</code> control it.
</p>

<ApiCard
	name="GPIO"
	purpose="One digital pin. Construct it with the pin and its flags — everything is set at
		construction."
	imports={"import { GPIO } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={gpioExample} label="basic-usage.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Construction flags</h3>
	<p class="text-sm leading-relaxed">
		Combine flags with <code>|</code>. The pin argument takes a board pin export
		(<code>LED</code>, <code>BUTTON</code>, <code>PB5</code>), a number, or a <code>Pin</code>
		instance.
	</p>
	<DocsTable headers={['Token', 'Zephyr equivalent', 'Meaning']} rows={flags} monoCols={[0, 1]} />

	<MethodDoc
		name="set"
		signature="set(value: boolean): void"
		params={[
		{
			name: 'value',
			type: 'boolean',
			units: 'logical level',
			description: 'true = "on". For board pins like LED, the polarity is handled for you.'
		}
		]}>
		<p>Drives the pin.</p>
	</MethodDoc>

	<MethodDoc name="get" signature="get(): boolean" returns="logical level">
		<p>Reads the logical level. Safe in a bare expression:</p>
		<CodeBlock code={'if (button.get()) { /* ... */ }'} label="expression-safe" class="mt-3" />
	</MethodDoc>

	<MethodDoc name="toggle" signature="toggle(): void">
		<p>Toggles the pin in a single step — never a read-then-write race.</p>
	</MethodDoc>

	<MethodDoc
		name="onInterrupt / offInterrupt"
		signature="onInterrupt(token, handler): void"
		params={[
			{
				name: 'token',
				type: 'GPIO.INT_*',
				units: 'edge/level token',
				description: 'e.g. GPIO.INT_EDGE_FALLING.'
			},
			{
				name: 'handler',
				type: '() => void',
				description: 'Called when the interrupt fires.'
			}
		]}>
		<CodeBlock code={interruptExample} label="interrupts.ts" class="mt-1" />
		<Callout>
			Handlers run in interrupt context — the ISR-safety rules apply. See
			<a href="/hal/docs/hardware-events" class="font-bold text-primary underline">Hardware Events</a>.
		</Callout>
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Method', 'Signature', 'Purpose']} rows={gpioMethods} monoCols={[1]} />
</ApiCard>

<ApiCard
	name="Pin"
	purpose="Typed pin object from the generated board module, re-exported through `@typecad/hal`. Pass
		it to GPIO in place of a number — the board definition already knows its capabilities, so a
		wrong-pin assignment is caught at compile time, not on the board."
	imports={"import { PB5 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={pinExample} label="pin-arguments.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		All three forms are equivalent for a plain GPIO; the board export is preferred because it
		carries polarity and binding information.
	</p>
</ApiCard>
