<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const contractJson = `{
  "version": 1,
  "mcu": { "symbol": "MCU_ST_STM32:STM32F411CEU6" },
  "connectedPins": {
    "6":  { "pinName": "XTAL1/PB6", "pinType": "bidirectional", "boardName": "SCL", "net": "SCL" },
    "7":  { "pinName": "PB7", "pinType": "bidirectional", "boardName": "SDA", "net": "SDA" },
    "14": { "pinName": "PA0", "pinType": "bidirectional", "boardName": "LED", "net": "LED" }
  },
  "availablePeripherals": { "i2c": true, "spi": false, "uart": false }
}`;

	const contractConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  soc: 'stm32f411xe',                       // the silicon, not a dev board
  contract: './hardware/myboard.contract.json',
  framework: '@typecad/framework-zephyr',
  frameworkData: { buildTarget: 'typecad_f411_dev' },
  zephyr: {
    customBoard: true,                       // generate the out-of-tree board
  },
};

export default config;`;

	const fieldDocs = [
		['mcu.symbol', 'The KiCAD symbol of the MCU — the only mcu field read'],
		['connectedPins', 'Keyed by pin number: pinName (compound names split on / and -), pinType (KiCAD direction), boardName (functional alias like LED/TX, or the pad name), net'],
		['externalComponents', 'reference, dnp, symbol, value, footprint — what hangs on the pin'],
		['availablePeripherals', 'i2c/spi/uart are true only when every pin the peripheral needs is wired'],
		['power pins', 'Excluded — power and ground never export as GPIO']
	];
</script>

<svelte:head>
	<title>Contracts — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Point hal at your own hardware: a .contract.json exported from a typeCAD board narrows the generated board module to exactly the pins you wired."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Contracts</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Dev-board targets are the easy case. For <em>your</em> board, a contract — a JSON file naming
	the MCU and every pin you wired — replaces the board catalog: the generated module contains
	only your pins, under the names you chose, and nothing else exists to reach.
</p>

<ApiCard
	name="the contract file"
	kind="reference"
	purpose="Exported from a typeCAD/pcb project and consumed here. Pin-name matching is
		deliberate: pad-form board names become the exported constant; compound pin names split into
		segments; non-pad board names become functional aliases (LED, TX, SCL)."
	imports={"myboard.contract.json"}>
	{#snippet example()}
		<CodeBlock code={contractJson} label="myboard.contract.json" />
	{/snippet}
	<DocsTable headers={['Field', 'Meaning']} rows={fieldDocs} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="configuring it"
	kind="reference"
	purpose="Contracts and dev-boards are mutually exclusive: soc + contract instead of board. The
		framework generates an out-of-tree Zephyr board for the silicon, and the narrowed board
		module drops out of the usual build."
	imports={"soc + contract"}>
	{#snippet example()}
		<CodeBlock code={contractConfig} label="typecad-hal.config.ts" />
	{/snippet}
	<Callout>
		Wrong pin? It never compiled anyway: reaching a pin the contract doesn't declare is a
		module-resolution error, same as unsupported hardware on a dev board.
	</Callout>
	<p class="mt-3 text-sm leading-relaxed">
		The hardware half of this story — exporting the contract from a
		<code>.kicad_pcb</code> — lives in the pcb docs. Contracts pair with the
		<a href="/pcb/docs/import" class="font-bold text-primary underline">import</a> workflow:
		design the board in typeCAD, flash the firmware against the same pins.
	</p>
</ApiCard>
