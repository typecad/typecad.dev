<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const componentExample = `import { Component } from '@typecad/pcb';

let u1 = new Component({ footprint: 'Package_SO:SOIC-8_5.3x5.3mm_P1.27mm' });`;

	const generatedExample = `import { Component } from '@typecad/pcb';
/**
 | Pin # | Name         | Type              |
 | --:   | :--          | :--               |
 | 8     | VCC          | power_in          |
 | 4     | GND          | power_in          |
 | 5     | AREF_PB0     | bidirectional     |
 | 1     | _RESET_PB5   | bidirectional     |
 */
export class ATtiny85_20S extends Component {
    VCC = this.pin(8, { type: 'power_in' });
    GND = this.pin(4, { type: 'power_in' });
    AREF_PB0 = this.pin(5, { type: 'bidirectional' });
    _RESET_PB5 = this.pin(1, { type: 'bidirectional' });

    constructor(reference?: string | undefined) {
        super("Package_SO:SOIC-8_5.3x5.3mm_P1.27mm");
        this.symbol = "MCU_Microchip_ATtiny:ATtiny85-20S";
        if (reference) this.reference = reference;
    }
}`;

	const useExample = `import { ATtiny85_20S } from './ATtiny85_20S';
let u1 = new ATtiny85_20S();`;

	const searchExample = `typecad search "voltage regulator"
typecad search LM358
typecad search "op amp" --format=json --limit=10`;

	const options = [
		['reference', 'string', 'Reference designator (R1, U2...)'],
		['value', 'string', 'Value of component'],
		['footprint', 'string', 'KiCAD footprint path, e.g. Package_SO:SOIC-8_5.3x5.3mm_P1.27mm'],
		['symbol', 'string', 'KiCAD symbol library path'],
		['prefix', 'string', 'Prefix for reference designator'],
		['datasheet', 'string', 'Link to component datasheet'],
		['description', 'string', 'Description of component'],
		['voltage', 'string', 'Voltage rating of component'],
		['wattage', 'string', 'Wattage rating of component'],
		['mpn', 'string', 'Manufacturer Part Number'],
		['dnp', 'boolean', 'true if Do Not Populate'],
		['simulation', 'object', "{ include: true, model: 'ngspice-model' }"],
		['pcb', 'object', 'Position on the board { x, y, rotation }'],
		['text', 'array', 'Arbitrary text entries on the board, with property, text, position, styling'],
		['fab', 'object', 'Fabrication layer text entry — a positioning object or [text, positioning] tuple'],
		['referenceLayout', 'object', 'Reference designator text position and style (defaults to F.SilkS)'],
		['valueLayout', 'object', 'Value text position and style (defaults to F.Fab)'],
		['fabLayout', 'object', 'Fab text position and style (defaults to F.Fab; text defaults to ${REFERENCE})']
	];
</script>

<svelte:head>
	<title>Components — typeCAD/pcb docs</title>
	<meta name="description" content="A component is anything that has a KiCAD symbol or footprint — resistors, MCUs, vias, mounting holes, regulatory images." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Components</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	A component is anything that has a KiCAD symbol or footprint — resistors, MCUs, vias, mounting
	holes, or regulatory images. The <code>Component</code> class is the base class for all of them.
</p>

<ApiCard
	name="Component"
	purpose="The base class for all components in typeCAD — in KiCAD terms, anything that has a
		footprint file associated with it. Construct it directly for simple parts, or extend it with
		named pins for ICs (usually via the add-component tool, below)."
	imports={"import { Component } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={componentExample} label="component.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Options</h3>
	<DocsTable headers={['Option', 'Type', 'Description']} rows={options} monoCols={[0, 1]} />
	<p class="mt-2 text-sm leading-relaxed">
		The three layout properties (<code>referenceLayout</code>, <code>valueLayout</code>,
		<code>fabLayout</code>) accept an <code>ITextPositioning</code> object and can be set at
		construction or assigned after creation.
	</p>

	<MethodDoc name="pin" signature="pin(number, config?): Pin">
		<p>
			Creates and registers a pin — see
			<a href="/pcb/docs/pins-power" class="font-bold text-primary underline">Pins &amp; Power</a>.
			In generated component files this is how named pins (<code>u1.VCC</code>) are defined.
		</p>
	</MethodDoc>
</ApiCard>

<div class="mt-10 border-2 border-foreground bg-card p-5 shadow-sm">
	<h2 class="text-lg font-bold">Connectors &amp; mechanical parts</h2>
	<p class="mt-2 text-sm leading-relaxed">
		A few common non-IC parts ship as ready-made classes, alongside the passives — all from the
		package root:
	</p>
	<div class="mt-3">
		<CodeBlock
			code={`import { Connector, TestPoint, MountingHole, NetTie } from '@typecad/pcb';

let j1 = new Connector({ number: 4 });            // 1x04 pin header (series presets: 'pin-header', 'JST-SH')
let tp1 = new TestPoint();                        // 1.0 mm pad probe point
let mh1 = new MountingHole({ size: 'M3' });       // M2–M8 presets
let tie1 = new NetTie({ net1: 'VBUS', net2: 'VOUT' });  // ties two nets, pin count follows the nets`}/>
	</div>
</div>

<div class="mt-10 border-2 border-foreground bg-card p-5 shadow-sm">
	<h2 class="text-lg font-bold">typecad add component</h2>
	<p class="mt-2 text-sm leading-relaxed">
		The better way to create components. Run <code>typecad add component</code> from the
		<code>./hw</code> directory, or click the <code>add_component</code> button in the VSCode GUI
		under NPM Scripts. It asks where the component comes from — the KiCAD library, a local file, or
		an EasyEDA/JLCPCB part — and generates a <code>.ts</code> file like this:
	</p>
	<div class="mt-3">
		<CodeBlock code={generatedExample} label="ATtiny85_20S.ts" />
	</div>
	<p class="mt-3 text-sm leading-relaxed">
		The file <code>extends Component</code> and adds <code>Pin</code> objects — so instead of
		<code>u1.pin(1)</code> you write <code>u1.VCC</code>. Use the generated class like any other:
	</p>
	<div class="mt-3">
		<CodeBlock code={useExample} label="use.ts" />
	</div>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Finding parts: typecad search</h3>
	<div class="mt-2">
		<CodeBlock code={searchExample} label="terminal" />
	</div>
	<p class="mt-2 text-sm leading-relaxed">
		Fuzzy-matches against the KiCAD symbol libraries and returns the symbol name, footprint, and
		description, in <code>LibraryName:SymbolName</code> format. Options:
		<code>--format</code> (detailed, compact, table, json), <code>--sort</code> (score, id,
		manufacturer, package), <code>--limit</code> (default 5).
	</p>

	<Callout label="EasyEDA/JLCPCB parts">
		For JLC's ecosystem, the <code>C###</code> number downloads the footprint and 3D model and
		creates the component. The EasyEDA→KiCAD conversion isn't always perfect — the most common
		issue is pin types coming through as <code>unspecified</code> — and not all parts have symbols
		or footprints.
	</Callout>
</div>
