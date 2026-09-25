<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const clockExample = `import { Clock, UART0 } from '@typecad/hal';

// set from a time server's answer, or a stamp your build host made
Clock.set(1765432100);

const now = Clock.now();
UART0.writeLine('epoch: ' + now);`;

	const batteryPairing = `import { Clock, Power } from '@typecad/hal';

// a duty cycle with timestamps: set once after a network join,
// then read before every sleep
const at = Clock.now();      // when did the board do its work?
log('published at ' + at);

Power.offFor(3_600_000);     // back in an hour, clock still set`;

	const methods = [
		['set(epochSeconds)', 'Set the wall clock — Unix epoch seconds, e.g. a time server\u2019s answer or a build-host stamp'],
		['now()', 'Read it back, also epoch seconds — 0 before the first set()']
	];

	const persistence = [
		['Hardware calendar RTC', 'The rtc alias points at a backup-domain calendar node — the time survives power loss'],
		['Counter-backed (the shim)', 'The synthesized rtc-counter keeps time only while its counter runs — a power loss resets it to 0']
	];
</script>

<svelte:head>
	<title>Clock — Wall-Clock Time (RTC) — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Clock.set() and Clock.now() — wall-clock time in Unix epoch seconds over the board's RTC: a hardware calendar where the board has one, a synthesized counter-backed shim everywhere else."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Clock — Wall-Clock Time (RTC)</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	<code>Clock</code> is wall-clock time: set it once and read it anywhere, in Unix epoch seconds.
	Underneath, it rides the board's RTC — a hardware calendar where the board ships one, and a
	synthesized counter-backed RTC everywhere else, so <code>Clock</code> exports on any board with
	a free counter.
</p>

<ApiCard
	name="Clock"
	kind="singleton"
	purpose="Set and read the wall clock. Values are Unix epoch seconds — a time server's answer or
		a stamp from your build host are both fine sources. Invalid dates cannot occur: the
		conversion is pure arithmetic."
	imports={"import { Clock } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={clockExample} label="clock.ts" />
	{/snippet}
	<DocsTable headers={['Method', 'What it does']} rows={methods} monoCols={[0]} />
	<Callout>
		<code>now()</code> reads <code>0</code> before the first <code>set()</code> — check for it
		when the board might have lost power.
	</Callout>
</ApiCard>

<ApiCard
	name="where the RTC comes from"
	kind="reference"
	purpose="Two paths, one class. Boards whose devicetree aliases a hardware calendar RTC export
		Clock backed by it. Every other board with a free counter gets a synthesized
		zephyr,rtc-counter shim — a child of the counter node, so the Counter class keeps the
		parent. Same facts that gate Counter, gating Clock."
	imports={"board-gated on the rtc alias or a free counter"}>
	{#snippet example()}
		<DocsTable
			headers={['Backing', 'Persistence']}
			rows={persistence}
		/>
	{/snippet}
	<p class="text-sm leading-relaxed">
		v1 semantics are session-scoped unless your board's <code>rtc</code> alias is a hardware
		calendar: on counter-backed boards, time lives while the counter runs. The generated
		overlay and build facts (<code>CONFIG_RTC</code> and the shim driver) are emitted
		automatically when your program uses <code>Clock</code> — nothing to wire by hand.
	</p>
</ApiCard>

<Callout label="Pairs with Power.offFor()">
	A battery board that sleeps between wakes wants timestamps on everything it did while awake —
	set the clock when a network is up, read it before
	<a href="/hal/docs/power" class="font-bold text-primary underline"><code>Power.offFor()</code></a>
	swallows the board again. On counter-backed boards, budget for the reset: re-set the clock
	after every wake that isn't calendar-backed.
	<CodeBlock code={batteryPairing} label="timestamped-cycle.ts" class="mt-3" />
</Callout>
