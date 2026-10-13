<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const posJlc = `typecad-pcb export pos --profile jlcpcb`;

	const posAll = `typecad-pcb export pos --profile kicad --centroid anchor
typecad-pcb export pos --profile openpnp --side front
typecad-pcb export pos --centroid pads --exclude "FID*,MH*,TP*"`;

	const bom = `typecad-pcb export bom --profile jlcpcb
typecad-pcb export bom --ungrouped`;

	const assembly = `typecad-pcb export assembly --profile jlcpcb`;

	const cpl = `Designator,Mid X,Mid Y,Layer,Rotation
C1,31.000,18.000,T,0
R1,10.200,10.000,T,90
J6,17.795,66.345,T,0`;

	const bomOut = `Comment,Designator,Footprint,LCSC Part #
1uF,C1,Capacitor_SMD:C_0805_2012Metric,C28323
100k,"R1, R2, R7",Resistor_SMD:R_0603_3191Metric,C25803`;

	const profiles = [
		['jlcpcb', 'Designator, Mid X, Mid Y, Layer, Rotation — T/B sides, the CPL their uploader expects'],
		['pcbway', 'Same columns, Top/Bottom spelled out'],
		['seeed', 'The Seeed Fusion PCBA flavor of the same CPL'],
		['openpnp', 'A native .board.xml you open straight from the Boards tab, plus the id,x,y,rotation,side CSV its importer reads — bottom parts already carry OpenPnP\'s KiCad transform'],
		['kicad', "kicad-cli's own pos-CSV semantics (anchor datum, 6-decimal mm, lowercase top/bottom)"],
		['generic', 'Every column and unit exposed — the escape hatch']
	];

	const posFlags = [
		['--profile=<id>', 'One of the profiles above (default generic)'],
		['--side=<front|back|both>', 'Which face to emit (default both)'],
		['--centroid=<anchor|pads|body>', 'What a row reports — see below (default: body, kicad uses anchor)'],
		['--origin=<board|aux>', 'Rebase coordinates onto the aux (drill/place) origin'],
		['--exclude=<globs>', 'Extra refs to drop, comma-separated — added to the profile defaults (FID*, MH*)'],
		['--rotation-offset=<deg>', 'Rotation added to every part'],
		['--bottom-rotation=<deg>', 'Extra rotation for bottom-side parts only'],
		['--include-dnp', 'Emit do-not-populate parts too (the kicad profile always does)'],
		['-o, --out=<dir>', 'Output directory (default ./build/assembly/)']
	];

	const bomFlags = [
		['--profile=<id>', 'BOM family of a placement profile (jlcpcb gets the JLC BOM shape)'],
		['--bom-profile=<jlcpcb|kicad|generic>', 'The BOM shape directly'],
		['--grouped / --ungrouped', 'One row per unique part, or one row per reference'],
		['--exclude=<globs>', 'Refs to drop, comma-separated'],
		['-o, --out=<dir>', 'Output directory (default ./build/assembly/)']
	];

	const centroidModes = [
		['anchor', "The footprint's origin — what KiCAD's own pos export reports"],
		['body', 'The center of the measured fab outline, rotated into place — what shops mean by "center of the part"'],
		['pads', 'The average of the pad centers']
	];
</script>

<svelte:head>
	<title>Assembly export — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="export pos, export bom, and export assembly: centroid files and BOMs for JLCPCB, PCBWay, Seeed, OpenPnP, or kicad-cli semantics — plus the one-shot zipped provider package."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Assembly export</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Getting a board made is gerbers and a drill file. Getting a board <em>assembled</em> is two more
	files: where every part sits (the centroid, also called CPL or pick &amp; place) and what the
	parts are (the BOM). <code>typecad-pcb export</code> writes both, plus a one-shot package with
	everything zipped. Our own writer — no KiCAD install needed, same as
	<a class="underline underline-offset-4" href="/pcb/docs/checks-export">the gerber export</a>.
</p>

<ApiCard
	name="export pos"
	kind="cli"
	purpose="The placement file. One command per provider — each profile is the column layout,
		side spelling, and units that provider's uploader expects."
	imports={'typecad-pcb export pos --profile <id>'}>
	{#snippet example()}
		<CodeBlock code={posJlc} label="terminal" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Profiles</h3>
	<div class="mt-3">
		<DocsTable headers={['Profile', 'Shape']} rows={profiles} monoCols={[0]} />
	</div>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Flags</h3>
	<div class="mt-3">
		<DocsTable headers={['Flag', 'Meaning']} rows={posFlags} monoCols={[0]} />
	</div>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">More examples</h3>
	<div class="mt-3">
		<CodeBlock code={posAll} label="terminal" />
	</div>
</ApiCard>

<ApiCard
	name="export bom"
	kind="cli"
	purpose="The bill of materials, joined from the board and the netlist the build leaves beside
		it. Parts with dnp: true and footprints marked exclude-from-BOM stay out."
	imports={'typecad-pcb export bom --profile jlcpcb'}>
	{#snippet example()}
		<CodeBlock code={bom} label="terminal" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Flags</h3>
	<div class="mt-3">
		<DocsTable headers={['Flag', 'Meaning']} rows={bomFlags} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="export assembly"
	kind="cli"
	purpose="The whole package in one go: native gerbers, drill, job file, placement, and BOM
		staged in ./build/assembly/&lt;board&gt;-&lt;profile&gt;/ and zipped into the file the shop's
		uploader takes. Every pos/bom flag applies here too."
	imports={'typecad-pcb export assembly --profile jlcpcb'}>
	{#snippet example()}
		<CodeBlock code={assembly} label="terminal" />
	{/snippet}
	<p class="mt-4 text-sm leading-relaxed">
		You get <code>&lt;board&gt;-jlcpcb.zip</code> and the staging directory beside it, so you
		can check what's in the zip before you upload it. <code>--no-zip</code> skips the zip.
	</p>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">What the files look like</h2>
<p class="mt-2 text-sm leading-relaxed">
	The JLCPCB profile's CPL — mm, integer rotation, T/B for the side:
</p>
<div class="mt-4">
	<CodeBlock code={cpl} label="build/assembly/board-cpl.csv" />
</div>
<p class="mt-4 text-sm leading-relaxed">
	And its BOM. <code>mpn</code> on your components lands in the LCSC column; refs collapse per
	unique value + footprint + part number:
</p>
<div class="mt-4">
	<CodeBlock code={bomOut} label="build/assembly/board-bom.csv" />
</div>
<p class="mt-4 text-sm leading-relaxed">
	Set the part number when you create the component:
</p>
<div class="mt-4">
	<CodeBlock code={`import { Component } from '@typecad/pcb';\n\nlet r1 = new Component({\n  reference: 'R1',\n  footprint: 'Resistor_SMD:R_0603_3191Metric',\n  value: '100k',\n  mpn: 'C25803',   // LCSC part number\n});`} label="components.ts" />
</div>
<p class="mt-4 text-sm leading-relaxed">
	No netlist, or one that's out of date? The BOM degrades to board-only columns (value,
	footprint, side) instead of failing — the part number column just stays empty.
</p>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Running your own machine</h2>
<p class="mt-2 text-sm leading-relaxed">
	The <code>openpnp</code> profile writes a native <code>&lt;board&gt;.board.xml</code> beside the
	CSV — open it from OpenPnP's Boards tab, no import step and no empty board to create first. It
	carries every placement with a part name derived the way OpenPnP's own KiCad importer does
	(footprint + value, e.g. <code>R_0603-10k</code>); a part that doesn't exist in your
	configuration loads unassigned, ready to map to a feeder in the Jobs tab. When the board has an
	Edge.Cuts outline, the board size rides along too.
</p>
<p class="mt-4 text-sm leading-relaxed">
	Bottom-side parts get OpenPnP's KiCad convention applied for you: x negated and the rotation
	mirrored (rot → 180 − rot), the transform its own KiCad .pos importer applies. The CSV keeps the
	same values, so File &gt; Import Placements lands the same placements on a board you already
	made. The shop profiles (JLCPCB and friends) don't do this — their uploaders ingest the
	unmodified KiCad frame.
</p>

<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Fiducials, outline, paste, and the parts library</h3>
<p class="mt-2 text-sm leading-relaxed">
	Four more things ride along with the openpnp profile, all from data the board already has:
</p>
<ul class="mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed">
	<li>
		<strong>Fiducials.</strong> <code>FID*</code> references ship as <code>type="Fiducial"</code>
		placements instead of being dropped — the machine aligns on them. Mounting holes stay out.
	</li>
	<li>
		<strong>Packages and parts.</strong> <code>&lt;board&gt;-packages.xml</code> and
		<code>&lt;board&gt;-parts.xml</code> define every package the board uses — pad layout and body
		size, which is what OpenPnP's bottom vision checks parts against — plus one part per unique
		footprint + value, named exactly like the board's part-ids. OpenPnP has no File &gt; Import for
		these; they're drop-in documents for the machine's configuration directory, or paste sources
		for its Parts tab. Part heights start at 0.0 — only you know your stackup.
	</li>
	<li>
		<strong>Board outline.</strong> An Edge.Cuts outline that closes ships as the board's
		<code>&lt;profile&gt;</code> path, so it draws as its real shape.
	</li>
	<li>
		<strong>Solder paste pads.</strong> Every pad on a paste layer lands in
		<code>solderPastePads</code> — for paste-dispensing setups instead of a stencil.
	</li>
</ul>

<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Re-exporting keeps your OpenPnP work</h3>
<p class="mt-2 text-sm leading-relaxed">
	Part associations live in the board file itself, so overwriting it would throw away the time
	you spent mapping placements to parts. It doesn't: re-running the export updates placement
	geometry (and the side, if a part flipped) while carrying over everything you set in OpenPnP —
	part assignments, Ignore/Fiducial types, enabled flags, comments. Placements whose reference no
	longer exists on the board are dropped and named in the log; ones you added by hand for parts
	still on the board (a fiducial, say) ride over untouched. Feeders and nozzle setups were never
	in the file — those live in OpenPnP's machine configuration and can't be touched by an export.
</p>
<p class="mt-4 text-sm leading-relaxed">
	Want a clean slate anyway? <code>--fresh-board</code> regenerates the board.xml from scratch,
	discarding the OpenPnP edits.
</p>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Which centroid?</h2>
<p class="mt-2 text-sm leading-relaxed">
	"Center of the component" has three answers, and it matters more than it sounds:
</p>
<div class="mt-4">
	<DocsTable headers={['Mode', 'Datum']} rows={centroidModes} monoCols={[0]} />
</div>
<p class="mt-4 text-sm leading-relaxed">
	Shop profiles default to <code>body</code>. A horizontal DO-41 diode anchors on pad 1 while
	its body center sits 3.81 mm away (half its 7.62 mm pitch) — a machine placing at the anchor
	drops the part half a pitch off. The kicad profile stays on <code>anchor</code> to match
	kicad-cli's output.
</p>

<div class="mt-6">
	<Callout label="Rotation">
		<p>
			Files carry the rotation the board stores, in the KiCAD frame (mm, Y-down). JLCPCB,
			PCBWay, and Seeed all ingest KiCAD-native data and adjust it on their side — PCBWay
			explicitly asks you not to pre-mirror bottom-side data. If your shop's preview shows
			bottom parts rotated wrong, <code>--bottom-rotation 180</code> is the switch; check it
			on one part before trusting the whole file.
		</p>
	</Callout>
</div>

<p class="mt-4 text-sm leading-relaxed">
	Fiducials and mounting holes don't go on the pick &amp; place — the shop profiles drop
	<code>FID*</code> and <code>MH*</code> by default, and <code>--exclude</code> adds your own
	patterns. Every command takes <code>--json</code>, and they run on the board from
	<code>./build/</code> or a path you pass.
</p>
