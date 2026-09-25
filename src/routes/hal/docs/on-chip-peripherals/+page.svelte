<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const counterExample = `import { Counter } from '@typecad/hal';

const tick = new Counter(0, { hz: 1000 });   // instance 0, 1 kHz alarms

tick.onAlarm(() => { ticks++; });            // fires once per wrap (interrupt context)
tick.start();
// ...
tick.stop();`;

	const watchdogExample = `import { Watchdog } from '@typecad/hal';

const wdt = new Watchdog(8000);   // 8 s window

wdt.enable();                      // arm — full CPU reset on expiry
// somewhere in the main loop:
wdt.feed();                        // keep it alive`;

	const counterMethods = [
		['new Counter(instance, { hz })', 'The alarm frequency is the construction fact; the index selects one of the chip\'s declared free counters'],
		['onAlarm(fn)', 'Fires once per period — interrupt context'],
		['start()', 'Arm the alarm at the constructed frequency'],
		['stop()', 'Stop the counter']
	];

	const watchdogMethods = [
		['new Watchdog(ms)', 'The timeout is the construction fact, in milliseconds'],
		['enable()', 'Arm — full CPU reset on expiry'],
		['feed()', 'Keep it alive — feed at least once per window'],
		['disable()', 'Not every chip supports disabling at runtime — treat as best-effort']
	];
</script>

<svelte:head>
	<title>On-Chip Peripherals — typeCAD/hal docs</title>
	<meta
		name="description"
		content="The hardware Counter for precise periodic alarms and the Watchdog for recovering a hung program — both configured at construction."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">On-Chip Peripherals</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Two built-in peripherals that need no external components: the <strong>hardware counter</strong>
	for precise periodic alarms, and the <strong>watchdog</strong> for recovering a hung program. Both
	are configured at construction and controlled with a handful of methods.
</p>
<p class="mt-3 text-sm leading-relaxed">
	Periodic software work belongs to a <code>Thread</code> — a kernel thread that sleeps between
	rounds. Use the hardware counter when you need deterministic, sub-millisecond periodic execution
	that does not depend on any thread.
</p>

<ApiCard
	name="Counter"
	purpose="One of the chip's hardware timers. The alarm frequency is the construction fact;
		start() arms it."
	imports={"import { Counter } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={counterExample} label="counter.ts" />
	{/snippet}
	<Callout>
		The instance index selects one of the chip's declared free counters — instance 0 is the first
		(for example RTC1 on the nRF52840). Using an index the chip does not have is a build error that
		names the available counters.
	</Callout>
	<MethodDoc name="onAlarm" signature="onAlarm(fn): Counter">
		<p>
			The handler runs in interrupt context — the same ISR-safety rules as
			<a href="/hal/docs/hardware-events" class="font-bold text-primary underline">Hardware Events</a>
			apply.
		</p>
	</MethodDoc>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={counterMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="Watchdog"
	purpose="A watchdog resets the chip if your program stops feeding it. The timeout is the
		construction fact, in milliseconds."
	imports={"import { Watchdog } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={watchdogExample} label="watchdog.ts" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={watchdogMethods} monoCols={[0]} />
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">What is not here</h2>
<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
	Capacitive-touch GPIOs and the on-die temperature sensor are not supported — there is no stable
	driver surface for either on the supported chips. Touch <em>display
	controllers</em> (FT6336U and friends) are a separate feature; temperature sensing is covered by
	the <a href="/hal/docs/sensors" class="font-bold text-primary underline">sensor catalog</a> (a
	<code>SENSOR.</code> part with a temperature channel).
</p>
