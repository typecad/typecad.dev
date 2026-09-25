<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const passivesExample = `import { PCB, Resistor, LED } from '@typecad/pcb';

let typecad = new PCB('typecad_docs');

let r1 = new Resistor({ value: '1kohm', size: '0805' });
let d1 = new LED({ value: 'green' });        // size defaults to '0603'`;

	const mixedSizes = `let r1 = new Resistor({ value: '1kohm', size: '0603' });
let c2 = new Capacitor({ value: '1uF', size: '0805' });`;

	const factoryExample = `import { passiveFactory } from '@typecad/pcb';

const passives = passiveFactory('0805');   // everything defaults to 0805
let r1 = new passives.Resistor({ value: '10kohm' });
let c1 = new passives.Capacitor({ value: '100nF', size: '0402' });  // per-part size wins`;

	const sizes = [
		["'1210'", 'all component types'],
		["'1206'", 'all component types'],
		["'0805'", 'all component types'],
		["'0603'", 'all component types — the default'],
		["'0402'", 'no fuses'],
		["'0201'", 'no fuses']
	];

	const references = [
		['reference passed', 'Used as-is; a name conflict is renamed with a warning in the build output'],
		['reference omitted', 'Generated from the prefix property and an internal counter by type — R1, R2, C1...'],
		['prefix omitted', 'Type defaults: R for resistors, C for capacitors, D for LEDs, etc.']
	];

	const uniqueFootprint = `let l1 = new Inductor({
  value: '1uH',
  footprint: 'Inductor_SMD:L_0805_2012Metric_Custom'
});`;
</script>

<svelte:head>
	<title>Passives — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Resistors, capacitors, LEDs, diodes, inductors, and fuses built into @typecad/pcb — pick a chip size with the size option."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Passives</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The common parts — resistors, capacitors, LEDs, diodes, inductors, fuses — are built into
	<code>@typecad/pcb</code>. There's no second package to install: import them from the package
	root and pick the physical size with the <code>size</code> option.
</p>

<ApiCard
	name="Resistor / LED / Capacitor / Diode / Inductor / Fuse"
	kind="classes"
	purpose="Pre-built Component subclasses for the common passives. The size option selects the
		KiCAD symbol and footprint preset; an explicit footprint or symbol always wins over it."
	imports={"import { Resistor } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={passivesExample} label="passives.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Sizes</h3>
	<DocsTable headers={["size", 'Notes']} rows={sizes} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Multiple sizes in one file</h3>
	<p class="text-sm leading-relaxed">
		There are no size modules to import — pass a different <code>size</code> per part:
	</p>
	<CodeBlock code={mixedSizes} label="mixed-sizes.ts" class="mt-2" />
	<Callout>
		Fuse presets exist only for <code>'0603'</code> and larger — the smaller chip sizes have no
		fuse footprint.
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Reference designators</h3>
	<DocsTable headers={['Case', 'Behavior']} rows={references} />
	<Callout>
		KiCAD tracks components by reference designator, so components sometimes swap references with
		each other based on when the build process encounters them. This only happens when a similar
		component is created before an already laid-out component — <strong>avoid it by sticking to
		one style: auto-generation or explicit references, not both.</strong>
	</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Unique footprints</h3>
	<p class="text-sm leading-relaxed">
		For a passive with a footprint outside the presets, pass it directly — an explicit
		<code>footprint</code> overrides the size preset:
	</p>
	<CodeBlock code={uniqueFootprint} label="unique.ts" class="mt-2" />
</ApiCard>

<ApiCard
	name="passiveFactory"
	kind="function"
	purpose="Builds a set of passive classes bound to one default size — the shape packages receive as
		this.passives. Handy on its own when a design mixes sizes heavily."
	imports={"import { passiveFactory } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={factoryExample} label="factory.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The bound size is a <em>default</em>: an explicit <code>size</code> on an individual part
		still wins. See
		<a href="/pcb/docs/packages" class="font-bold text-primary underline">Packages</a> for how
		package authors receive one of these automatically.
	</p>
</ApiCard>
