<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const outline = `import { PCB } from '@typecad/pcb';

let pcb = new PCB('typecad_docs');
pcb.outline(100, 100, 50, 50, 1);   // x, y, w, h, fillet`;

	const outlineShapes = `pcb.outlinePolygon([
  { x: 0, y: 0 },
  { x: 40, y: 0 },
  { x: 40, y: 25 },
  { x: 0, y: 20 },
]);

pcb.outlineCircle(20, 12, 10);

pcb.cutoutCircle(20, 12, 3);          // internal cutout
pcb.cutout([{ x: 5, y: 5 }, { x: 9, y: 5 }, { x: 9, y: 8 }, { x: 5, y: 8 }]);

pcb
  .outlinePath(0, 0)
  .lineTo(40, 0)
  .arcTo(40, 20, { x: 46, y: 10 })    // KiCAD 3-point arc (end + mid)
  .lineTo(0, 20)
  .close();`;

	const zone = `import { PCB } from '@typecad/pcb';

let pcb = new PCB('zone_example');

pcb.zone({
  net: 'GND',
  layers: ['B.Cu'],
  x: 0,
  y: 0,
  width: 50,
  height: 30,
});

pcb.keepout({
  layers: ['F.Cu', 'B.Cu'],
  x: 20,
  y: 10,
  width: 20,
  height: 15,
  restrictions: { tracks: true, vias: true, copperpour: true },
});

pcb.create();`;

	const zoneOptions = [
		['net | pin', 'string | Pin', 'Attaches the pour to a net; omitting both creates an unconnected pour (KiCAD net 0)'],
		['layers', 'string[]', 'required — copper layers the zone fills'],
		['x, y, width, height', 'number', 'Rectangle form (mm)'],
		['points', 'array', 'Explicit polygon (≥ 3 vertices)'],
		['bounds', 'BoardBounds', 'Bounds rectangle — e.g. bounds: pcb.board; provide one geometry form, not combinations'],
		['fill', 'object | false', 'Fill options (below); false leaves an unfilled outline'],
		['priority', 'number', 'Fill priority when zones overlap'],
		['name', 'string', 'Zone name in KiCAD']
	];

	const fillOptions = [
		['mode', "'solid' | 'hatched'", 'Fill style'],
		['connectPads', "'thru_hole_only' | 'full' | 'no'", 'Pad connections to the pour'],
		['thermalGap', 'number', 'Gap around thermal relief pads (mm, default 0.254)'],
		['thermalBridgeWidth', 'number', 'Spoke width (mm, default 0.4064)'],
		['minThickness', 'number', 'Minimum copper island thickness (mm)'],
		['smoothing', "'chamfer' | 'fillet' | 'none'", 'Island corner style'],
		['islandRemovalMode', 'number', '0 never / 1 always / 2 remove islands below the minimum area (default)'],
		['islandAreaMin', 'number', 'Minimum island area (mm²) for mode 2'],
		['hatchStyle / hatchPitch / hatchThickness / hatchGap', 'mixed', 'Hatched-fill geometry'],
		['arcSegments', 'number', 'Fill arc approximation (default 16)']
	];

	const keepoutOptions = [
		['layers', 'string[]', 'required — layers the keepout applies to'],
		['x, y, width, height | points | bounds', 'mixed', 'One geometry form'],
		['restrictions', 'object', '{ tracks, vias, pads, copperpour, footprints } — what is restricted in the area'],
		['placement', 'boolean', 'Also restrict footprint placement (default false)'],
		['priority', 'number', 'Keepout priority']
	];

	const via = `import { PCB, Resistor } from '@typecad/pcb';

let typecad = new PCB('typecad_docs');
let r1 = new Resistor({ value: '1kohm', size: '0603' });

let via = typecad.via({
  at: { x: 10, y: 10 },
  size: 0.6,
  drill: 0.3,
});

typecad.net(r1.pin(1), via.pin(1));
typecad.create(r1, via);`;

	const rulesOption = `let pcb = new PCB('typecad_docs', {
  rules: {
    min_track_width: 0.127,
    min_via_diameter: 0.5,
  },
});`;

	const jlcpcbRules = [
		['min_clearance', '0.2 mm'],
		['min_track_width', '0.2 mm'],
		['min_via_diameter', '0.6 mm'],
		['min_through_hole_diameter', '0.3 mm'],
		['min_via_annular_width', '0.15 mm'],
		['min_copper_edge_clearance', '0.2 mm'],
		['min_hole_to_hole', '0.25 mm']
	];

	const netClass = `const usb = typecad.named('USB_DP').net(u1.DP, conn.DP);

typecad.netClass('usb90', {
  track_width: 0.25,
  clearance: 0.15,
  layers: ['In1.Cu'],      // preferred routing layers
});

typecad.netClass('power', { track_width: 0.5, via_diameter: 0.8 });
typecad.assign(usb, 'usb90');`;

	const netClassOptions = [
		['track_width', 'number', 'mm — defaults to the board rule, floored at it'],
		['clearance', 'number', 'mm — same floor behavior'],
		['via_diameter / via_drill', 'number', 'mm — via dimensions for the class'],
		['layers', 'string[]', 'Preferred routing layers; the router prefers them. Not written to the KiCAD project file']
	];

	const stackup = `let pcb = new PCB('four_layer', { layers: 4 });

pcb.stackup(4, {
  copper_finish: 'ENIG',
  dielectric_constraints: true,     // needed for controlled impedance
  layers: {
    'In1.Cu': { thickness: 0.035, material: 'FR4' },
    'dielectric 1': { epsilon_r: 4.5, thickness: 0.21 },
  },
});`;

	const stackupOptions = [
		['copper_finish', "'None' | 'HASL' | 'ENIG'", 'Surface finish (default None)'],
		['dielectric_constraints', 'boolean', 'Build the dielectric table — required for impedance targets (default false)'],
		['layers', 'Record<string, override>', 'Per-layer overrides keyed by copper name (In1.Cu), dielectric N, F.Mask, B.Mask, F.SilkS, B.SilkS, F.Paste, B.Paste'],
		['override.thickness', 'number', 'mm — total thickness is re-compensated so the board still matches options.thickness'],
		['override.material / epsilon_r / loss_tangent / color', 'mixed', 'Layer material facts. Defaults follow the JLCPCB standard stackup: FR4, εr 4.5, loss tangent 0.02']
	];

	const planeAndPolicy = `pcb.plane('GND', 'In1.Cu');     // board-covering pour with thermal reliefs
pcb.plane('VBUS', 'In2.Cu');

pcb.viaPolicy({ type: 'blind-buried', maxSpan: 2 });`;

	const impedance = `// standalone: the width that hits 50 Ω ± 5 on In1.Cu
let w = pcb.impedanceWidth('In1.Cu', 50, 5);

// or as a routing option — the trace widens to the target
typecad.route(usb90, { impedance: { target: 90, tolerance: 5 } });`;

	const stitch = `pcb.stitch('GND', {
  layers: ['F.Cu', 'B.Cu'],   // via span (default: first → last copper layer)
  pitch: 1.5,                 // grid spacing, mm (default 1.5)
  margin: 0.5,                // inset from the board edge, mm
});`;

	const stitchOptions = [
		['net', 'string', 'required — the net the stitching vias join'],
		['layers', 'string[]', 'Via span (default: through, first → last copper layer)'],
		['pitch', 'number', 'Grid spacing in mm (default 1.5)'],
		['size / drill', 'number', 'Via dimensions — default to the board rules'],
		['area', 'IBoundsLike', 'Where to stitch (default: the board outline)'],
		['margin', 'number', 'Inset from the board edge in mm (default 0.5)']
	];

	const teardrops = `pcb.teardrops({
  shape: 'round',       // 'round' | 'rect'
  maxLength: 1.0,       // mm
  smdPads: true,        // also on SMD pads
  trackEnds: false,     // bare track ends too
});`;

	const teardropOptions = [
		['enabled', 'boolean', 'Master switch (default true)'],
		['vias', 'boolean', 'Teardrop router-placed and declared vias (default true)'],
		['throughHolePads / smdPads', 'boolean', 'Pad teardrops (default true)'],
		['trackEnds', 'boolean', 'Teardrop bare track ends (default false)'],
		['shape', "'round' | 'rect'", 'Teardrop shape (default round)'],
		['maxLength / maxHeight', 'number', 'Teardrop size limits in mm (defaults 1.0 / 2.0)']
	];

	const outlineParams = [
		['x, y', 'number', 'mm', 'Position of the top-left corner'],
		['width, height', 'number', 'mm', 'Board dimensions'],
		['fillet', 'number', 'mm', 'Optional corner fillet radius']
	];

	const graphics = [
		['rect({ bounds | x,y,w,h | start,end })', 'Rectangle'],
		['circle({ center, radius | end })', 'Circle'],
		['line({ start, end })', 'Line segment'],
		['poly({ points })', 'Polygon'],
		['arc({ start, mid, end })', 'KiCAD 3-point arc'],
		['text({ text, x, y, ... })', 'Text on the board']
	];

	const textPositioning = [
		['x, y, rotation', 'number', 'Position (mm) and rotation (degrees)'],
		['layer', 'string', 'Copper or technical layer'],
		['font', 'string', 'TrueType face — omit for KiCAD\u2019s default stroke font'],
		['width, height / fontSize', 'number', 'Glyph size (mm)'],
		['thickness', 'number', 'Stroke thickness'],
		['bold / italic / show', 'boolean', 'Text style toggles'],
		['justify', 'object', "{ horizontal: 'left'|'right'|'center', vertical: 'top'|'bottom'|'middle', mirror }"]
	];
</script>

<svelte:head>
	<title>Board Layout — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Outlines, zones and keepouts, planes, vias, stitching, teardrops, design rules, net classes, stackup, and controlled impedance — everything that defines the physical board."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Board Layout</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Everything that defines the physical board: outlines, zones, vias, graphics, design rules, net
	classes, and the stackup. Placement of components is covered in
	<a href="/pcb/docs/placement" class="font-bold text-primary underline">Placement</a>.
</p>

<ApiCard
	name="outline"
	kind="method"
	purpose="The board outline, emitted on Edge.Cuts as native KiCAD primitives: a rectangle with
		optional fillets, polygons, circles, internal cutouts, and a path builder for arcs."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={outline} label="outline.ts" />
	{/snippet}
	<DocsTable headers={['Parameter', 'Type', 'Units', 'Description']} rows={outlineParams} monoCols={[0, 1]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Non-rectangular boards</h3>
	<CodeBlock code={outlineShapes} label="shapes.ts" class="mt-2" />
	<MethodDoc name="outlinePath" signature="outlinePath(x, y): OutlinePathBuilder">
		<p>
			Starts at <code>(x, y)</code>, then <code>lineTo(x, y)</code>,
			<code>arcTo(endX, endY, mid)</code> (KiCAD's 3-point arc — the arc passes through
			<code>mid</code>), and <code>close()</code> to seal the shape with a final line.
		</p>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="zone / keepout"
	kind="method"
	purpose="Filled copper zones (ground pours) and keepout areas. Zone fills can be tuned per zone
		or set to KiCAD's defaults."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={zone} label="zones.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Zone options</h3>
	<DocsTable headers={['Option', 'Type', 'Description']} rows={zoneOptions} monoCols={[0, 1]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Fill options (fill: {'{...}'})</h3>
	<DocsTable headers={['Option', 'Type', 'Description']} rows={fillOptions} monoCols={[0, 1]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Keepout options</h3>
	<DocsTable headers={['Option', 'Type', 'Description']} rows={keepoutOptions} monoCols={[0, 1]} />
</ApiCard>

<ApiCard
	name="via"
	kind="method"
	purpose="Vias can be created, placed, and connected like any other component — connected through
		pin(1). Router-placed vias follow the board's via policy, below."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={via} label="via.ts" />
	{/snippet}
	<MethodDoc
		name="via (options)"
		signature={"pcb.via({ at, size, drill, powerInfo? }): Via"}
		params={[
			{ name: 'at', type: 'object', units: 'mm', description: '{ x, y } position' },
			{ name: 'size', type: 'number', units: 'mm', description: 'Via diameter (default 0.8)' },
			{ name: 'drill', type: 'number', units: 'mm', description: 'Drill diameter (default 0.4)' },
			{ name: 'powerInfo', type: 'object', description: '{ current, maxTempRise, thickness } — checks current against the via rating using IPC-2221 (maxTempRise default 10 °C, thickness default 35 µm)' }
		]}>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="graphics"
	kind="method group"
	purpose="Graphics primitives drawn on the board."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<DocsTable headers={['Method', 'Description']} rows={graphics} monoCols={[0]} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Text positioning (ITextPositioning)</h3>
	<p class="text-sm leading-relaxed">
		Board text and the per-component <code>referenceLayout</code> / <code>valueLayout</code> /
		<code>fabLayout</code> properties all take the same positioning object:
	</p>
	<div class="mt-3">
		<DocsTable headers={['Field', 'Type', 'Description']} rows={textPositioning} monoCols={[0, 1]} />
	</div>
</ApiCard>

<ApiCard
	name="group"
	kind="method"
	purpose="KiCAD groups — move and lay out related parts together in the editor."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={`typecad.group('power', r1, c1, c2);`} label="group.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Accepts components and manual <code>TrackBuilder</code> tracks. Packages call this
		automatically — every package's parts land in one named group.
	</p>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Design rules</h2>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Rules default to the JLCPCB no-surcharge standard and are written to
	<code>./build/{'{name}'}.kicad_pro</code> for DRC. Override any subset with the
	<code>rules</code> constructor option; the router, via defaults, and stitching all read the
	final values.
</p>
<div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
	<div>
		<CodeBlock code={rulesOption} label="rules.ts" />
	</div>
	<div>
		<DocsTable headers={['Default (JLCPCB standard)', 'Value']} rows={jlcpcbRules} monoCols={[0]} />
	</div>
</div>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Net classes</h2>
<ApiCard
	name="netClass / assign"
	kind="method"
	purpose="Group nets with shared width, clearance, and via dimensions. The router uses the net's
		class ahead of the board defaults; every class dimension is floored at the board rule."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={netClass} label="net-classes.ts" />
	{/snippet}
	<DocsTable headers={['Option', 'Type', 'Description']} rows={netClassOptions} monoCols={[0, 1]} />
	<Callout>
		The class name <code>Default</code> is reserved — it stays in sync with the board rules.
	</Callout>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Stackup, planes & impedance</h2>
<ApiCard
	name="stackup"
	kind="method"
	purpose="Declares the layer stack. Layers is a constructor option (2–32 copper layers); stackup()
		refines it with finish, dielectric constraints, and per-layer overrides. JLCPCB-standard
		defaults ship built in."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={stackup} label="stackup.ts" />
	{/snippet}
	<DocsTable headers={['Option', 'Type', 'Description']} rows={stackupOptions} monoCols={[0, 1]} />
</ApiCard>

<ApiCard
	name="plane / viaPolicy"
	kind="methods"
	purpose="plane(net, layer) declares a board-covering power or ground pour on one copper layer —
		materialized at create() as a filled zone with thermal reliefs, and excluded from the
		router's default layers. viaPolicy controls what vias the router may place."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={planeAndPolicy} label="planes.ts" />
	{/snippet}
	<MethodDoc
		name="viaPolicy"
		signature={"viaPolicy({ type: 'through' } | { type: 'blind-buried', maxSpan? })"}>
		<p>
			<code>'through'</code> is the default. With <code>'blind-buried'</code>,
			<code>maxSpan</code> (default 2) caps how many layer boundaries one via may cross — deeper
			transitions fall back to through vias.
		</p>
	</MethodDoc>
	<Callout>One plane per layer — declaring a second plane on the same layer is an error.</Callout>
</ApiCard>

<ApiCard
	name="impedanceWidth"
	kind="method"
	purpose="Controlled impedance against the declared stackup. Outer layers model as microstrip,
		inner layers as symmetric stripline. With a tolerance, the width snaps to a 0.01 mm grid
		that stays inside the target."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={impedance} label="impedance.ts" />
	{/snippet}
	<MethodDoc
		name="impedanceWidth"
		signature="impedanceWidth(layer, targetOhms, toleranceOhms?): number"
		params={[
			{ name: 'layer', type: 'string', description: 'A declared copper layer' },
			{ name: 'targetOhms', type: 'number', description: 'Target characteristic impedance' },
			{ name: 'toleranceOhms', type: 'number', description: 'Snap the width within ± this many ohms' }
		]}>
		<p>Throws a RangeError for unknown layers or targets the stackup can't reach.</p>
	</MethodDoc>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Stitching & teardrops</h2>
<ApiCard
	name="stitch"
	kind="method"
	purpose="Grids of stitching vias joining a net across layers — placed at create() against the
		finished board, skipping anything the clearance forbids."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={stitch} label="stitch.ts" />
	{/snippet}
	<DocsTable headers={['Option', 'Type', 'Description']} rows={stitchOptions} monoCols={[0, 1]} />
</ApiCard>

<ApiCard
	name="teardrops"
	kind="method"
	purpose="Teardrop reinforcement where traces meet vias and pads — written into the KiCAD project
		and generated as real geometry for router-placed vias."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={teardrops} label="teardrops.ts" />
	{/snippet}
	<DocsTable headers={['Option', 'Type', 'Description']} rows={teardropOptions} monoCols={[0, 1]} />
</ApiCard>
