<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const boardConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  board: 'xiao_ble/nrf52840',   // a qualified Zephyr board target
};

export default config;`;

	const boardModule = `.typecad-hal/
  board.ts               ← what '@typecad/hal' resolves to
  board.json             ← the same facts, machine-readable
  typecad-hal-env.d.ts   ← ambient types (Owned, Shared, Mutable, SafeVariable...)`;

	const gateway = `import { GPIO, LED, I2C0, PWM } from '@typecad/hal';
// ↑ this specifier resolves to .typecad-hal/board.ts — the board module.
// PWM only exists above if the board's timers support it: importing it on a
// board without PWM fails at module resolution, not on the bench.`;

	const moduleContents = [
		['Pins', "One constant per pin — datasheet names, plus silkscreen aliases (D0–D10, A0–A5, SDA/SCL) pointing at the same Pin"],
		['LED / BUTTON', 'From the Zephyr led0/sw0 devicetree aliases when the board defines them'],
		['Buses', 'One export per wired controller: I2C0, SPI0, UART0, USB0'],
		['Gated hardware', 'PWM, ADC, DAC, Watchdog, Counter, I2CTarget, SPITarget, UART, USBConsole, Keyboard, Mouse, CAN, I2S, Power, Clock, Store, File — exported only when the board supports them'],
		['Always present', 'GPIO, Time, Thread, Sensor, and the core language features']
	];

	const factsFile = `{
  "boards": {
    "myboard/mysoc": {
      "adc": {
        "channels": [{ "pin": "PA1", "channel": 9 }]
      },
      "pwm": {
        "specs": [{ "pin": "PB7", "controller": "pwm0", "channel": 2 }]
      }
    }
  }
}`;

	const overrides = `// per-construction override — facts, not bypasses
let a1 = new ADC(PA0, { channel: 3, device: 'adc1' });
let p1 = new PWM(PB7, { periodNs: 1_000_000, controller: 'pwm0', channel: 2 });`;

	const boardCmds = [
		['typecad-hal board sync [zephyr-base]', 'Rebuild the catalog from your installed Zephyr tree — run it after west update'],
		['typecad-hal board regen', 'Force-regenerate the project board module'],
		['automatic', 'Every build checks the catalog is fresh and regenerates board.ts when needed']
	];
</script>

<svelte:head>
	<title>Boards &amp; Targets — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Board targets come from your Zephyr tree; the first build generates a board module that '@typecad/hal' resolves to — with only the hardware your board actually has."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Boards &amp; Targets</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	There is no curated board list to install — the catalog is generated from the Zephyr tree
	you already have, and every board variant in it is a target. Pick one in the config; the build
	generates a board module that becomes your import of <code>'@typecad/hal'</code>.
</p>

<ApiCard
	name="the board module"
	kind="reference"
	purpose="The first build (or typecad-hal board regen) writes .typecad-hal/board.ts — pin map,
		buses, and capability flags harvested from the board's devicetree. Your project's tsconfig
		maps '@typecad/hal' onto it, so every import is board-specific by construction."
	imports={"board: 'xiao_ble/nrf52840'"}>
	{#snippet example()}
		<CodeBlock code={boardConfig} label="typecad-hal.config.ts" />
	{/snippet}
	<CodeBlock code={boardModule} label=".typecad-hal/" class="mt-3" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">What's in the module</h3>
	<DocsTable headers={['Export', 'What it is']} rows={moduleContents} />
</ApiCard>

<ApiCard
	name="the hardware gateway"
	kind="concept"
	purpose="The board module is narrowed: it only re-exports hardware the board actually has.
		Writing code against hardware the target lacks fails at module resolution — before anything
		is generated, flashed, or debugged on a bench."
	imports={"import { GPIO, LED, I2C0 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={gateway} label="main.ts" />
	{/snippet}
	<Callout>
		Same code, different board, different surface: a board without DAC makes
		<code>import {'{ DAC }'}</code> a compile error. The unsupported-hardware list is a feature,
		not a limitation.
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Catalog commands</h3>
	<DocsTable headers={['Command', 'What it does']} rows={boardCmds} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="custom pin facts"
	kind="pattern"
	purpose="When the catalog hasn't harvested a routing you need — an ADC channel, a PWM controller —
		supply the fact and the whole pipeline treats it as its own: same validation, same lowering.
		Board-wide via typecad-hal.facts.json, per-construction via options."
	imports={"typecad-hal.facts.json"}>
	{#snippet example()}
		<CodeBlock code={factsFile} label="typecad-hal.facts.json" />
	{/snippet}
	<CodeBlock code={overrides} label="overrides.ts" class="mt-3" />
	<p class="mt-2 text-sm leading-relaxed">
		User routes replace the harvested route per pin (the build prints the shadowing), and edits
		to the facts file regenerate the board module. The final escape hatch is
		<code>rawCpp()</code> — see
		<a href="/hal/docs/transpiler" class="font-bold text-primary underline">The transpiler</a>.
	</p>
</ApiCard>
