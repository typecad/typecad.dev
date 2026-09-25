<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const canExample = `import { CAN } from '@typecad/hal';

const bus = new CAN();        // 500 kbit/s — the automotive middle
bus.begin();                  // mode + bitrate, then start

bus.send(0x123, [0x11, 0x22]);

bus.onReceive((id: number, len: number, b0: number, b1: number): void => {
  // fires from interrupt context for every frame on the wire
});`;

	const loopback = `import { CAN, Time } from '@typecad/hal';

// no transceiver, no bus — the bench test
const bus = new CAN(0, { loopback: true, hz: 500_000 });

let gotId = -1;
bus.onReceive((id: number, len: number): void => {
  if (gotId < 0) gotId = id;   // ISR discipline: copy, don't busy-work
});
bus.begin();

bus.send(0x123, [0x11, 0x22]);      // loops back to your own filter
Time.sleep(100);
// gotId === 0x123 — the whole path, proven`;

	const methods = [
		['begin()', 'Configure and start — applies the constructed mode + bitrate, then starts once. Idempotent'],
		['send(id, data, extended?)', 'One frame: 11-bit standard id (29-bit with extended), up to 8 bytes. Blocks briefly until the controller accepts it'],
		['onReceive(handler)', 'Accept-all filter — the handler fires per frame as scalars (id, len, b0…b7), unused bytes zero']
	];

	const constructorOpts = [
		['instance', 'number', 'Controller index — 0 is the board\u2019s first, the only one on virtually every board'],
		['hz', 'number', 'Bus bitrate (default 500 kbit/s)'],
		['loopback', 'boolean', 'Route every sent frame back to this controller\u2019s own filters — the bench-test mode (default false)']
	];
</script>

<svelte:head>
	<title>CAN Bus — typeCAD/hal docs</title>
	<meta
		name="description"
		content="The CAN bus, Zephyr-shaped: begin/send/onReceive over the board's harvested controller — ESP32 TWAI, STM32 bxCAN, NXP FlexCAN — with a loopback mode that proves the whole path with no transceiver."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">CAN Bus</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	One controller per board — the harvested <code>can@</code> devicetree node, whatever silicon
	carries it (ESP32 TWAI, STM32 bxCAN, NXP FlexCAN) — with Zephyr's verbs: configure and start,
	send a frame, and a receive filter. Classic CAN: 11-bit ids (29-bit extended), payloads up to
	8 bytes.
</p>

<ApiCard
	name="CAN"
	kind="class"
	purpose="A bus handle constructed with its facts — instance, bitrate, mode — and three verbs.
		begin() applies the constructed facts in the order classic CAN requires (stopped for
		mode/bitrate changes, then start); send() builds one can_frame; onReceive() installs an
		accept-all filter."
	imports={"import { CAN } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={canExample} label="can.ts" />
	{/snippet}
	<DocsTable headers={['Constructor option', 'Type', 'Meaning']} rows={constructorOpts} monoCols={[0, 1]} />
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Method', 'What it does']} rows={methods} monoCols={[0]} />
	<Callout>
		Annotate the <code>onReceive</code> callback's parameters
		(<code>(id: number, len: number, b0: number...) => void</code>) — the handler runs in the
		controller's interrupt context, so keep it to the matrix discipline: copy the frame into a
		variable or queue, do the real work in the main loop.
	</Callout>
</ApiCard>

<ApiCard
	name="loopback — the bench test"
	kind="pattern"
	purpose={`The zero-hardware verification: begin({ loopback: true }) routes every sent frame back
		to this controller's own filters. No transceiver, no wiring, no second node — and the round
		trip exercises the whole path: devicetree enable, driver init, frame build, tx submission,
		filter callback.`}
	imports={"new CAN(0, { loopback: true })"}>
	{#snippet example()}
		<CodeBlock code={loopback} label="loopback.ts" />
	{/snippet}
	<Callout>
		This exact round trip is the CAN hardware test — a frame sent in loopback arrives at the
		receive filter intact, asserted on real silicon by the test runner.
	</Callout>
</ApiCard>

<Callout label="Classic CAN in v1">
	11/29-bit ids and ≤8-byte payloads only: CAN-FD, the bitrate data phase, and RTR frames are
	not surfaced. <code>CAN</code> is board-gated like all hardware — it exists only where the
	devicetree declares a controller — and using it emits
	<code>CONFIG_CAN</code> automatically. See
	<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards &amp; Targets</a>.
</Callout>
