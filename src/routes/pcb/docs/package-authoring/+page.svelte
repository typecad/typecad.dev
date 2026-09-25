<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const scaffold = `cd hw
typecad-pcb add package --component=true --kicad=true \\
  --symbol=MCU_Microchip_ATtiny:ATtiny3227-M \\
  --footprint=Package_SO:SOIC-20W_7.5x12.8mm_P1.27mm \\
  --name=my-tiny-board`;

	const addPackageFlags = [
		['--empty=true | --component=true', 'Exactly one — an empty utility package or one wrapping a component'],
		['--name=<name>', 'Package and class name'],
		['--kicad=true | --local=true | --jlcpcb=true', 'Where the component comes from (component packages)'],
		['--symbol= / --footprint=', 'KiCAD library paths for --kicad'],
		['--c=<C-number>', 'JLCPCB part number for --jlcpcb'],
		['--folder=<path>', 'Output directory (default ./src)']
	];

	const structure = [
		['package.json', 'npm metadata — publish like any other package'],
		['src/index.ts', 'The package class — what consumers import'],
		['src/<component>.ts', 'The generated component file (component packages)'],
		['./build/', 'Symbols, footprints, and 3D models the package ships']
	];

	const packageCode = `import { Package, Power } from '@typecad/pcb';
import { ATtiny3227_M } from './ATtiny3227_M';

export interface TinyBoardOptions {
  vin?: Power;          // caller's supply — the package wires itself to it
}

export class TinyBoard extends Package<TinyBoardOptions> {
  declare u1: ATtiny3227_M;
  declare c1: Component;
  declare power: Power;

  build(options: TinyBoardOptions) {
    this.u1 = new ATtiny3227_M();
    this.c1 = new this.passives.Capacitor({ value: '100nF' });

    this.net(this.u1.VCC, this.c1.pin(1));
    this.net(this.u1.GND, this.c1.pin(2));

    if (options.vin) {
      this.net(options.vin.power, this.u1.VCC);
      this.net(options.vin.gnd, this.u1.GND);
    }
  }
}`;

	const baseClass = [
		['build(options)', 'required — create the parts, wire them, position them. Runs once at construction'],
		['this.passives', 'Passive classes bound to one size — passiveSize option, \u20190603\u2019 default'],
		['this.net(...pins)', 'Connects pins inside the package'],
		['this.track()', 'Manual tracks — register them with this.add(...) so they\u2019re collected'],
		['this.via(at, size?, drill?)', 'A via inside the package'],
		['this.add(...items)', 'Add anything the auto-collector can\u2019t see (tracks)'],
		['this.components', 'Everything the package placed — consumers spread it into create()']
	];

	const autoCollect = `export class TinyBoard extends Package {
  declare r1: Component;

  build(options) {
    this.r1 = new this.passives.Resistor({ value: '10kohm' });
    // no this.add() needed — assigned properties are collected automatically
  }
}`;

	const consumerUse = `let board = new TinyBoard({ pcb: typecad, x: 40, y: 30, vin: usb_power });
typecad.create(...board.components);`;
</script>

<svelte:head>
	<title>Package authoring — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Publish circuit modules on npm: scaffold with add package, build the class with build() and this.passives, and ship symbols and footprints in the package."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Package authoring</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	A package extends <code>Package</code> — the base class for reusable, importable hardware
	modules. Its <code>build()</code> creates the parts and wires them once; consumers get the whole
	sub-circuit from one constructor call. Consuming packages is covered in
	<a href="/pcb/docs/packages" class="font-bold text-primary underline">Packages</a>.
</p>

<ApiCard
	name="typecad-pcb add package"
	kind="command"
	purpose="Scaffolds a package in ./src: package.json, the package class, and (for component
		packages) a generated component file. Run it from the hw/ directory."
	imports={"typecad-pcb add package"}>
	{#snippet example()}
		<CodeBlock code={scaffold} label="terminal" />
	{/snippet}
	<DocsTable headers={['Flag', 'Meaning']} rows={addPackageFlags} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">What's generated</h3>
	<DocsTable headers={['Path', 'What it is']} rows={structure} monoCols={[0]} />
	<Callout>
		Non-KiCAD-library components must ship their symbol, footprint, and 3D model in the
		package's <code>./build</code> directory — the scaffold sets this up. Builds sync it into the
		consumer's <code>./build/lib/</code> automatically (file-timestamp guarded — there is no
		postinstall script; npm deprecated those).
	</Callout>
</ApiCard>

<ApiCard
	name="Package"
	kind="base class"
	purpose="The abstract base class. Extend it with your own options as the generic parameter;
		build() does the work. Construction handles everything else: offset positioning from x/y,
		part collection, grouping, and the build/lib sync."
	imports={"import { Package } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={packageCode} label="index.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Inside build()</h3>
	<DocsTable headers={['Member', 'Purpose']} rows={baseClass} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Collection</h3>
	<p class="text-sm leading-relaxed">
		Every <code>Component</code> or <code>TrackBuilder</code> assigned to a property of
		<code>this</code> during <code>build()</code> is collected automatically, offset by the
		consumer's <code>x</code>/<code>y</code>, and grouped under the package name:
	</p>
	<CodeBlock code={autoCollect} label="collection.ts" class="mt-2" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">The consumer's view</h3>
	<CodeBlock code={consumerUse} label="use.ts" class="mt-2" />
	<Callout>
		Declare component properties with <code>declare</code> and assign them inside
		<code>build()</code> — creating parts in field initializers runs too early. Components as
		public properties is the convention: consumers reach pins through them
		(<code>board.u1.GND</code>).
	</Callout>
</ApiCard>

<ApiCard
	name="publishing"
	kind="workflow"
	purpose="Packages are ordinary npm packages — version them, tag them, publish them publicly or
		to a private registry. Semantic versions mean consumers can pin and update hardware like
		any dependency."
	imports={"npm publish"}>
	{#snippet example()}
		<CodeBlock
			code={`npm version patch
npm publish --access public`}
			label="terminal" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Utility packages — BOM post-processors, fab exporters, lint rules — are the same story with
		no hardware: plain npm packages whose code imports the consumer's
		<code>PCB</code> programmatically.
	</p>
</ApiCard>
