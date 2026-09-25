<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { HAL_DOC_GROUPS } from '$lib/config/hal-docs';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	const pinExample = `import { GPIO, ADC, PWM, LED, A1, PB6 } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT | GPIO.OUTPUT_INIT_LOW);  // set / get / toggle
const sense = new ADC(A1);                                      // read / readMillivolts
const motor = new PWM(PB6, { periodNs: 20_000_000 });           // setPulse / setDuty`;

	const rawCpp = `import { rawCpp, rawCppExpr } from '@typecad/hal';

rawCpp('PORTB |= (1 << PB5)');      // statement injected at the call site
const pb5 = rawCppExpr('PORTB');    // expression form — where a value is expected`;

	const include = `import { include } from '@typecad/hal';

include('<Wire.h>');   // adds a C++ #include to the output; no-op while type-checking`;

	const board = `import { board } from '@typecad/hal';

const resolution = board('peripherals.pwm.resolution');`;

	const time = `import { Time } from '@typecad/hal';

Time.sleep(1000);        // blocks at the top level
await Time.sleep(50);    // inside an async function: other tasks run while you wait
const ms = Time.now();   // milliseconds since boot, monotonic, no wrap
Time.busyWaitUs(3);      // a sub-millisecond spin`;

	const thread = `import { Thread } from '@typecad/hal';

const blinker = new Thread(0, { stackKb: 2 });   // 0 = the first thread slot
blinker.start(() => {
  while (true) {
    led.toggle();
    Time.sleep(500);
  }
});
blinker.join();          // park main here — the thread runs forever`;

	const async_ = `import { Async } from '@typecad/hal';

async function heartbeat() {
  while (true) {
    led.toggle();
    await Time.sleep(500);      // other tasks run while you wait
  }
}

await Async.sleep(1000);        // non-blocking sleep
await Async.yield();            // let other tasks run once`;

	const singletons = `import { LED, UART0, I2C0, GPIO } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);
UART0.writeLine('hello');
const dev = I2C0.device(0x44);      // register verbs callable immediately`;
</script>

<svelte:head>
	<title>HAL reference — typeCAD/hal docs</title>
	<meta
		name="description"
		content="The hardware abstraction layer: every pin, bus, and built-in feature is an object, and mistakes are caught before the firmware reaches the board."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🧰 Hardware Abstraction Layer (HAL)</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The HAL is the set of TypeScript objects you use to talk to the board — each pin, bus, and built-in
	feature is an object, and the HAL checks that you're using them in ways the hardware actually
	supports. A wrong pin assignment, a missing setup step, or two features fighting over the same pin
	is caught before the firmware reaches the board.
</p>

<h2 class="mt-10 text-2xl font-bold tracking-tight">Areas</h2>
<p class="mt-2 text-sm text-muted-foreground">
	Every class follows one shape: <strong>construction carries the configuration</strong> (pin
	flags, baud, period, broker URI — all set where the object is created). Units
	are what the hardware talks: nanoseconds for PWM, raw counts for ADC, milliseconds throughout.
</p>
{#each HAL_DOC_GROUPS as group, gi (group.title)}
	<p class="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground underline decoration-2 underline-offset-4">
		{group.title}
	</p>
	<div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each group.areas as a (a.slug)}
			<a
				href="/hal/docs/{a.slug}"
				class="group border-2 border-foreground bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5">
				<span class="flex items-center gap-1.5 font-bold">
					{a.title}
					<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
				</span>
				<span class="mt-1 block text-sm text-muted-foreground">{a.blurb}</span>
			</a>
		{/each}
		{#if gi === 0}
			<a
				href="/hal/examples"
				class="group border-2 border-foreground bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5">
				<span class="flex items-center gap-1.5 font-bold">
					Examples
					<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
				</span>
				<span class="mt-1 block text-sm text-muted-foreground">
					Complete firmware projects — the whole flow end to end
				</span>
			</a>
		{/if}
	</div>
{/each}

<h2 class="mt-12 text-2xl font-bold tracking-tight">Compile-time directives</h2>
<p class="mt-2 text-sm text-muted-foreground">
	Three functions that exist purely for code generation — the TypeScript never executes.
</p>

<ApiCard
	name="rawCpp / rawCppExpr"
	kind="directive"
	purpose="Inject raw C++ at the call site — for features the HAL does not cover, such as mDNS or OTA."
	imports={"import { rawCpp } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={rawCpp} label="raw-cpp.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="include"
	kind="directive"
	purpose="Adds a C++ #include to the generated firmware."
	imports={"import { include } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={include} label="include.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="board"
	kind="directive"
	purpose="Resolves a board definition value at compile time — the generated board module's facts,
		by path."
	imports={"import { board } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={board} label="board-facts.ts" />
	{/snippet}
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Pin model</h2>
<p class="mt-2 text-sm text-muted-foreground">
	Pins are typed objects, not integer constants. Everything imports from
	<code>@typecad/hal</code>, including the named board pins. Using a pin for something it cannot do
	(analog on a digital-only pad, PWM on a non-PWM pin) is caught at build time with the valid pins
	named.
</p>
<div class="mt-4">
	<CodeBlock code={pinExample} label="pin-arguments.ts" />
</div>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Timing, threads, async</h2>
<p class="mt-3 text-sm leading-relaxed">
	One <code>Time</code> object with a blocking sleep, monotonic clocks, and a sub-millisecond spin:
</p>
<div class="mt-3">
	<CodeBlock code={time} label="time.ts" />
</div>

<p class="mt-5 text-sm leading-relaxed">
	Periodic and concurrent work is a <code>Thread</code> — a real background thread, not a callback
	timer. Construction carries the stack size and
	priority; <code>start(fn)</code> schedules it; <code>join()</code> blocks until it exits. For
	deterministic sub-millisecond periodic execution use the
	<a href="/hal/docs/on-chip-peripherals" class="font-bold text-primary underline">hardware Counter</a>
	instead.
</p>
<div class="mt-3">
	<CodeBlock code={thread} label="thread.ts" />
</div>

<p class="mt-5 text-sm leading-relaxed">
	Long waits — <code>Time.sleep</code>, network requests — can yield, so the rest of your program
	keeps running while you wait. When you need to wait without blocking other tasks,
	<code>Async</code> gives you the cooperative forms:
</p>
<div class="mt-3">
	<CodeBlock code={async_} label="async.ts" />
</div>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Board singletons</h2>
<p class="mt-2 text-sm text-muted-foreground">
	Bus singletons are ready to use — <code>UART0.writeLine(...)</code> needs no construction, and
	<code>I2C0.device(0x44)</code> hands back a working target. A board that lacks a controller does
	not export its name — that is a module-resolution error at build time, not a runtime surprise.
</p>
<div class="mt-4">
	<CodeBlock code={singletons} label="singletons.ts" />
</div>

<div class="mt-12 border-t-2 border-foreground pt-6">
	<a href="/hal/docs/getting-started" class={buttonVariants({ size: 'lg' })}>
		Get started <ArrowRight class="size-4" />
	</a>
	<p class="mt-6 text-sm text-muted-foreground">
		Something wrong or missing?
		<a
			href="https://github.com/typecad/hal"
			target="_blank"
			rel="noreferrer"
			class="font-bold text-primary underline hover:no-underline">
			Open an issue
		</a>
		— we'd rather hear about it.
	</p>
</div>
