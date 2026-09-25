<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const pcbExample = `import { PCB } from '@typecad/pcb';
import { ATtiny85_20S } from './ATtiny85_20S';

let typecad = new PCB('typecad_concepts', { thickness: 1.6, copper_thickness: 35 });

let u1 = new ATtiny85_20S();
typecad.net(u1.VCC, u1.GND);

typecad.create(u1);`;

	const packageExample = `import { Package, Component } from '@typecad/pcb';

export class MyResistor extends Package {
  declare resistor: Component;

  build(options) {
    this.resistor = new this.passives.Resistor({ value: '10kohm' });
    this.resistor.pcb = { x: 100, y: 100, rotation: 0 };
  }
}`;

	const pcbConstructorOptions = [
		['Boardname', 'string', 'required', 'Name and filename of the generated files'],
		['options.thickness', 'number', 'mm', 'Board thickness'],
		['options.copper_thickness', 'number', 'microns', 'Copper thickness (1 oz = 35 microns) — used in power-aware calculations']
	];

	const pcbMethods = [
		['new PCB(name, options?)', 'Create the board; the name determines the output filenames'],
		['create(...items)', 'Include components, tracks, vias, and buses in the PCB, schematic, and netlist'],
		['net(...pins)', 'Connect any number of pins (see Connections)'],
		['named(name)', 'Name the next net — visible in KiCAD'],
		['route(net | { from, to }, options?)', 'Auto-route a connection (see Routing)'],
		['track()', 'Start a manual track — returns a TrackBuilder'],
		['via({ at, size, drill })', 'Create a via; connect through pin(1)'],
		['outline(x, y, w, h, fillet?)', 'Rectangle board outline'],
		['zone(options) / keepout(options)', 'Copper pours and keepout areas'],
		['group(name, ...components)', 'Group components on the PCB'],
		['place(component, { x, y, rotation? })', 'Position a component'],
		['board', 'Live board bounds — center, edges, corners (see Placement)'],
		['rect / circle / line / poly / text', 'Graphics primitives on the board'],
		['bom()', 'Bill of materials data'],
		['stage(...items)', 'Stage components without emitting them']
	];
</script>

<svelte:head>
	<title>The PCB class — typeCAD/pcb docs</title>
	<meta name="description" content="The PCB class is where components are added, connections are made, layout is defined, and utility functions live." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">The PCB class</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	<code>PCB</code> is the main class — it represents the entire circuit. Components are added to it,
	connections are made through it, board layout is defined on it, and the utility functions (ERC,
	BOM, routing) hang off it. One <code>PCB</code> per board; connections are made between components
	in the same <code>PCB</code>.
</p>

<ApiCard
	name="PCB"
	purpose="The board. Construct it with a name (the only required option — it determines the names of
		the resulting KiCAD files), add components and connections, then create()."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={pcbExample} label="typecad.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Constructor options</h3>
	<DocsTable
		headers={['Option', 'Type', 'Units', 'Description']}
		rows={pcbConstructorOptions}
		monoCols={[0, 1]} />
	<p class="mt-2 text-sm leading-relaxed">
		The thicknesses are used in power-aware calculations. The name determines
		<code>./build/{'{name}'}.kicad_pcb</code>, <code>.kicad_sch</code>, <code>.net</code>, and
		<code>.csv</code>.
	</p>

	<MethodDoc name="create" signature="create(...items): void">
		<p>
			After components have been created and modified, call <code>create</code> to include them in
			the PCB, schematic, and netlist. Accepts components, buses, tracks, and vias.
		</p>
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={pcbMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="Package"
	kind="base class"
	purpose="Abstract base class for reusable, importable hardware modules. Extend it to encapsulate a
		circuit sub-design — a voltage regulator, sensor module, or MCU subsystem — and publish it as
		an npm package."
	imports={"import { Package } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={packageExample} label="my-resistor.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The constructor handles offset positioning (<code>x</code>, <code>y</code>), auto-collects all
		<code>Component</code> properties set on <code>this</code>, groups them on the PCB, and
		automatically syncs the package's bundled KiCAD symbol/footprint files (its
		<code>./build/lib/</code>) into the project's <code>./build/lib/</code> directory — no install
		script required. For classes that don't extend <code>Package</code>, the exported
		<code>syncThisPackageBuildLib()</code> helper provides the same sync with one call.
	</p>
</ApiCard>
