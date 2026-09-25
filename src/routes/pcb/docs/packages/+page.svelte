<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const install = `cd hw
npm install @typecad/rd-bq24210`;

	const useExample = `import { PCB } from '@typecad/pcb';
import { RD_BQ24210 } from '@typecad/rd-bq24210';

let typecad = new PCB('solar_charger');

let charger = new RD_BQ24210({
  pcb: typecad,
  x: 40,
  y: 30,          // where the module lands on the board
});

// wire to the module like any other component
typecad.named('VBUS').net(charger.VBUS, j1.pin(1));
typecad.create(...charger.components);`;

	const options = [
		['pcb', 'PCB', 'required — the board the package lands on'],
		['x, y', 'number', 'required — where the module sits; every part inside is offset from it'],
		['reference', 'string', 'Reference prefix override'],
		['name', 'string', 'The KiCAD group name (defaults to the class name)'],
		['passiveSize', 'PassiveSize', 'Chip size the package\u2019s built-in passives use (default \u20190603\u2019)'],
		['passives', 'PassiveFactory', 'Swap the passive factories out entirely']
	];

	const dnp = `charger.STATUS_LED.dnp = true;   // keep it in the design, skip it in the BOM`;

	const customOptions = `// package side — options extend PackageOptions
export class RD_BQ24210 extends Package<{ isense?: number }> { ... }

// consumer side — they arrive as constructor options
let charger = new RD_BQ24210({ pcb: typecad, x: 40, y: 30, isense: 0.05 });`;
</script>

<svelte:head>
	<title>Packages — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Install circuit modules with npm: published packages drop a working sub-circuit — parts, passives, and placement — straight into a board."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Packages</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	A package is a circuit module distributed on npm: <code>npm install</code> a voltage regulator,
	an MCU subsystem, or a complete reference design, and one constructor call drops the whole
	sub-circuit — parts, passives, connections, and placement — onto the board. To publish your own,
	see <a href="/pcb/docs/package-authoring" class="font-bold text-primary underline">Package authoring</a>.
</p>

<ApiCard
	name="using a package"
	kind="workflow"
	purpose="Packages are installed in the hw/ directory — that's where the build runs. Import the
		class, construct it with a PCB and a position, and create its components like any others."
	imports={"npm install <package>"}>
	{#snippet example()}
		<CodeBlock code={install} label="terminal" />
	{/snippet}
	<CodeBlock code={useExample} label="board.ts" class="mt-3" />
	<p class="mt-3 text-sm leading-relaxed">
		Everything inside the package is reachable as public properties — read pins to wire to it,
		exactly like a generated component file:
	</p>
	<Callout>
		Published packages under the <code>@typecad</code> scope include reference designs
		(<code>@typecad/rd-*</code>) and utility packages like <code>@typecad/jlcpcb-export</code>.
		Utility packages are plain npm packages with no hardware inside — scripts and tools that
		work on a board.
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Constructor options</h3>
	<DocsTable headers={['Option', 'Type', 'Description']} rows={options} monoCols={[0, 1]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Do not populate</h3>
	<p class="text-sm leading-relaxed">
		Individual parts of a package can be marked DNP after construction — they stay in the
		schematic but drop out of the BOM and assembly:
	</p>
	<CodeBlock code={dnp} label="dnp.ts" class="mt-2" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Custom options</h3>
	<p class="text-sm leading-relaxed">
		Packages define their own options alongside the standard ones — a charger might take a sense
		resistor value, a regulator its output voltage:
	</p>
	<CodeBlock code={customOptions} label="options.ts" class="mt-2" />
</ApiCard>
