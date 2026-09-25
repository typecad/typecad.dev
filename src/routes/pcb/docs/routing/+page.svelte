<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const routeNet = `import { PCB } from '@typecad/pcb';
import { Resistor } from '@typecad/passives/0805';

let typecad = new PCB('autoroute_example');

let r1 = new Resistor({ value: '1kohm', reference: 'R1' });
let r2 = new Resistor({ value: '1kohm', reference: 'R2' });

r1.pcb = { x: 10, y: 10, rotation: 0 };
r2.pcb = { x: 20, y: 10, rotation: 0 };

const signal_net = typecad.named('signal').net(r1.pin(1), r2.pin(1));

typecad.route(signal_net);

typecad.create(r1, r2);`;

	const routeDirect = `let tracks = await typecad.route({
  from: r1.pin(1),
  to: r2.pin(1),
});

typecad.create(r1, r2, ...tracks);`;

	const routeConfig = `typecad.route(signal_net, {
    gridResolution: 0.15,
    debug: false,
});`;

	const manualTrack = `import { PCB } from '@typecad/pcb';

let pcb = new PCB('typecad_docs');

let power_track = pcb
  .track()
  .powerInfo({ current: 1.0, maxTempRise: 10, thickness: 35 })
  .from({ x: 100, y: 100 }, 'F.Cu', 0.2)
  .to({ x: 110, y: 100 })
  .via({ size: 0.8, drill: 0.4 })
  .to({ x: 110, y: 120, layer: 'B.Cu' });

pcb.create(power_track);`;

	const routeOptions = [
		['from / to', 'Pin or array of pins', 'required', 'The endpoints'],
		['width', 'number', 'mm', 'Trace width — calculated from powerInfo if omitted'],
		['layers', 'string[]', 'layer names', "Restrict to specific copper layers (e.g. ['F.Cu', 'B.Cu'])"],
		['powerInfo', 'object', 'A / °C / µm', '{ current, maxTempRise, thickness } — automatic IPC-2221 trace width'],
		['waypoints', 'array', 'mm', 'Array of { x, y } points to guide the path'],
		['clearance', 'number', 'mm', 'Minimum clearance from other objects'],
		['gridResolution', 'number', 'mm', 'Search grid — lower values increase the search space and memory usage'],
		['impedance', 'object', 'Ω', '{ target, tolerance } — widens the trace to hit the target from the stackup']
	];
</script>

<svelte:head>
	<title>Routing — typeCAD/pcb docs</title>
	<meta name="description" content="The auto router generates tracks between connected pins; TrackBuilder builds manual point-to-point tracks with vias." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Routing</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	typeCAD includes an auto router that generates tracks between connected pins, and a fluent
	track builder for manual point-to-point routing.
</p>

<ApiCard
	name="route"
	kind="method"
	purpose="Auto-route a net or a pin pair. Call it on the PCB instance with a net definition, or
		directly between pins; the returned tracks are included with create()."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={routeNet} label="route-net.ts" />
	{/snippet}

	<MethodDoc name="route (direct)" signature={"await pcb.route({ from, to })"}>
		<p>Route directly between pins without a named net:</p>
		<CodeBlock code={routeDirect} label="route-direct.ts" class="mt-3" />
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Options</h3>
	<DocsTable headers={['Option', 'Type', 'Units', 'Description']} rows={routeOptions} monoCols={[0, 1]} />

	<Callout>
		The router's fallback trace width and clearance come from the board's design rules (JLCPCB
		no-surcharge standard by default), or from the net's net class if it has one — per-route
		<code>width</code> and <code>clearance</code> override them for an individual trace. By default
		it uses every copper layer the board declares, minus layers dedicated as planes; router-placed
		vias follow the board's via policy. See
		<a href="/pcb/docs/board-layout" class="font-bold text-primary underline">Board Layout</a>.
	</Callout>

	<CodeBlock code={routeConfig} label="route-config.ts" class="mt-3" />
</ApiCard>

<ApiCard
	name="TrackBuilder"
	purpose="Fluent API for manual tracks — go point to point, using vias to transition between
		layers. Nets and connections are not required: KiCAD connects any track that touches an
		element with a net."
	imports={"import { TrackBuilder } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={manualTrack} label="manual-track.ts" />
	{/snippet}
	<MethodDoc
		name="powerInfo"
		signature={".powerInfo({ current, maxTempRise, thickness })"}
		params={[
			{ name: 'current', type: 'number', units: 'amps', description: 'Current the trace carries' },
			{ name: 'maxTempRise', type: 'number', units: '°C', description: 'Maximum wanted temperature rise (default 10)' },
			{ name: 'thickness', type: 'number', units: 'microns', description: 'Copper thickness (35 = 1 oz)' }
		]}>
		<p>Automatic IPC-2221 trace width calculation.</p>
	</MethodDoc>
</ApiCard>
