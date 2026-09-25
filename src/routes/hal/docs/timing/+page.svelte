<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const blockingSleep = `Time.sleep(1000);        // blocks at the top level`;

	const asyncSleep = `async function poll() {
  while (true) {
    await Time.sleep(50);      // other tasks run during the wait
    // ...read a sensor, update a display...
  }
}`;

	const busyWait = `Time.busyWaitUs(3);       // spins — for sub-millisecond timing`;

	const clocks = `const start = Time.now();       // milliseconds since boot
const us = Time.nowUs();        // microseconds since boot`;

	const elapsed = `if (Time.now() - start > 5000) {   // correct at minute 1 and month 6
  // five seconds have passed
}`;

	const threadExample = `import { Thread } from '@typecad/hal';

const blinker = new Thread(0, { stackKb: 2 });
blinker.start(() => {
  while (true) {
    led.toggle();
    Time.sleep(500);
  }
});`;

	const timeMethods = [
		['Time.sleep(ms)', 'Yielding sleep; await it inside async code and other tasks keep running'],
		['Time.now()', 'Milliseconds since boot, monotonic, double — no wrap'],
		['Time.nowUs()', 'Microseconds since boot, double; millisecond resolution on every board'],
		['Time.busyWaitUs(us)', 'Spin-wait — never yields; sub-millisecond protocol timing only']
	];
</script>

<svelte:head>
	<title>Timing &amp; Clocks — typeCAD/hal docs</title>
	<meta
		name="description"
		content="One object, four verbs: a yielding sleep, two monotonic clocks that never wrap, and a spin for sub-millisecond protocol timing."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Timing &amp; Clocks</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	One object, four verbs. <code>Time</code> covers the whole timing vocabulary: a yielding sleep,
	two monotonic clocks, and a spin for sub-millisecond protocol timing.
</p>

<ApiCard
	name="Time"
	kind="singleton"
	purpose="The whole timing vocabulary in one object. The clocks are monotonic and never wrap, so
		elapsed-time checks stay correct for the life of the program."
	imports={"import { Time } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={blockingSleep + '\n\n' + asyncSleep + '\n\n' + busyWait} label="time.ts" />
	{/snippet}

	<MethodDoc name="sleep" signature="Time.sleep(ms): void">
		<p>
			At the top level this blocks <code>main</code> until the time passes. Inside a Thread it
			blocks that thread only — everything else keeps running. Inside an
			<code>async</code> function, <code>await</code> the same call and other tasks run while you
			wait.
		</p>
	</MethodDoc>

	<MethodDoc name="busyWaitUs" signature="Time.busyWaitUs(us): void">
		<p>
			For sub-millisecond protocol timing where waiting would break the waveform. This is the only
			<code>Time</code> call that never yields — do not use it for long waits; it holds the CPU.
		</p>
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Clocks</h3>
	<p class="text-sm leading-relaxed">
		Two monotonic clocks, both counting from boot. Both return <strong>doubles</strong>, so they
		never wrap. Elapsed-time arithmetic is plain subtraction — there is no unsigned wraparound to
		guard against.
	</p>
	<CodeBlock code={clocks + '\n\n' + elapsed} label="clocks.ts" class="mt-3" />

	<Callout>
		<code>Time.nowUs()</code> is uptime-derived on every board, so its resolution is the uptime
		tick — one millisecond. For sub-millisecond <em>deterministic</em> timing use the
		<a href="/hal/docs/on-chip-peripherals" class="font-bold text-primary underline">hardware Counter</a>
		— it fires from interrupt context and does not depend on any thread.
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Periodic work</h3>
	<p class="text-sm leading-relaxed">
		<code>Time</code> deliberately has no callback timers. Periodic work belongs to a
		<code>Thread</code> — or, when the period must be exact to the microsecond, to a hardware
		<code>Counter</code> alarm.
	</p>
	<CodeBlock code={threadExample} label="periodic.ts" class="mt-3" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={timeMethods} monoCols={[0]} />
</ApiCard>
