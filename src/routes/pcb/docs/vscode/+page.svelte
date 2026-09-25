<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	const install = `npx typecad-pcb create   # the extension lands in hw/.vscode/extensions/
code typecad_project.code-workspace`;

	const hoverFacts = [
		['Identity', 'Reference, value, footprint, and placement — position, rotation, side'],
		['Pads', 'Per-pad table: pad number, net, signal type, connected / unconnected'],
		['View on board', 'A link on the hover zooms the board viewer to that component'],
		['Missing parts', 'A declared component absent from the compiled board gets an explanation, not silence']
	];

	const views = [
		[
			'Gerber view',
			'Fab output layer by layer — visibility and opacity controls, a fab report (dimensions, trace lengths, drill table), and DRC markers when a typecad-pcb drc report exists'
		],
		[
			'PCBA view',
			'A themed 2D assembled-board render — substrate, soldermask, silkscreen, and Fritzing-style component glyphs drawn from gerber X2 pad attributes, no board file or KiCAD needed'
		],
		[
			'Blueprint view',
			'The board as an engineering drawing — paper and ink outlines, dimension lines, a title block, and hatched zone pours'
		],
		[
			'ngspice view',
			'The electrical view — traces colored by net voltage, parts by power, animated current flow, and the solved operating point on hover'
		],
		[
			'Copper ΔT',
			'The thermal view — where the layout heats up at this operating point: wires, vias, pours, and the FR4 itself as a heat field'
		]
	];

	const viewerTools = [
		['Pan / zoom / fit', 'All five views share one SVG frame — one viewport, every render'],
		['Ruler', 'Measure with shift-angle snap'],
		['Component search', 'Find a designator on the board'],
		['Net highlighting', 'Click copper to light up a net — the match pops against a dimmed board'],
		['Hover readout', 'Status-line readout with source references, e.g. R1 { source r1 }'],
		['Themes & export', 'Dark / light themes, SVG and PNG export']
	];

	const electrical = [
		['Trace heat map', 'Every trace colored by its net\'s solved voltage, with a volt legend and range'],
		['Part heat map', 'Components colored by dissipated power on a log scale'],
		['Current flow', 'Animated particles along the copper, driven by the signed per-net currents — direction and magnitude at a glance'],
		['Hover readout', 'Hover a trace for the operating point: net voltage plus the connected devices\' current and power'],
		['All copper layers', 'Top layer solid; deeper layers drawn as construction-line centerlines with their real widths carried along for the models']
	];

	const thermal = [
		['Wires', 'Colored by IPC-2221 temperature rise from each wire\'s solved current and its real gerber width — a wire sized for its current reads its rated rise; a neck-down lights up'],
		['Zone pours', 'A 2D sheet-resistance solve over the actual fill polygon, driven by per-pad current injections — heating appears where the copper funnels, and stitch-via bottlenecks show as hot rings'],
		['Vias', 'Rated by the IPC-2152 barrel formula on the drilled diameter; pads color like wires so a stressed via ring reads at a glance'],
		['The board itself', 'A stacked two-layer steady-state FR4 field: wire, via, and pour losses heat the laminate, conducted and convected — with component self-heating injected at the pads. Rendered as one continuous field over the whole board'],
		['Hover readout', 'The status bar reports the temperature under the cursor — the trace or via\'s own rise over copper, the sampled FR4 field elsewhere, each as rise + absolute'],
		['Controls', 'Ambient temperature, allowed rise, and a color-by-margin mode; the legend shows the board\'s own ΔT range']
	];

	const blueprint = [
		['Paper & ink', 'Blueprint paper, the board and component outlines in ink strokes, thin outlined pads, and drill marks'],
		['Dimensions', 'Fabrication-drawing dimension lines with extension lines and arrowheads measure overall width and height; corner ticks mark the four extents'],
		['Title & info blocks', 'A title block below the board (name, date, dimensions) and an info block listing the source layers, units, side, and version'],
		['Pours & traces', 'Zone pours render as explicit diagonal hatch lines clipped to the outline; traces keep their real widths'],
		['Designators', 'Labels come from the fab layer, with synthetic labels only when the layer set has none']
	];

	const crossProbe = [
		[
			'Editor → board',
			'Component hovers carry a view-on-board link; hovering the net name in a pcb.net(...) / pcb.route(...) call highlights that net\'s traces. Palette equivalents — View Component / View Net on Board — prompt for a name seeded from the cursor'
		],
		[
			'Board → editor',
			'Double-click a trace or a pad to jump to the line that declared or routed its net; double-click a component outline to jump to its declaration'
		],
		[
			'Problems → board',
			'Unconnected-pad, single-pin-net, and DRC diagnostics carry Show R1 on board / Show net VCC on board actions that zoom the viewer to the culprit'
		]
	];

	const ambient = [
		[
			'Status bar',
			'The build target at a glance — rd_skeleton · 28 parts · 3 unconnected · 2E 5W — with a stale flag when hw sources are newer than the built board. Click opens the Board viewer'
		],
		[
			'Build Board CodeLens',
			'A ▶ Build Board lens on every TypeScript file in the hw folder — one click runs npm run build in a reused terminal, and an open viewer refreshes when the build lands'
		],
		[
			'Problems pane',
			'Unconnected pads and single-pin nets surface as warnings aimed at the declaring source lines; Run DRC maps kicad-cli violations the same way, and its counts land in the status bar'
		],
		[
			'Declaration chips',
			'An italic "R1 · 2 unconnected pads" chip sits after the declaration line in the editor'
		],
		[
			'Notifications',
			'Every dead end is actionable — a "no compiled board" notice carries a Build Board button; render failures carry Open Output'
		]
	];

	const commands = [
		['typecad-pcb.buildBoard', 'Build Board — npm run build in a reused terminal'],
		['typecad-pcb.viewBoard', 'View Board — open the board viewer panel'],
		['typecad-pcb.viewComponent', 'View Component on Board — zoom to a designator'],
		['typecad-pcb.viewNet', 'View Net on Board — highlight a net\'s copper'],
		['typecad-pcb.runDrc', 'Run DRC — violations land in Problems at their source lines'],
		['typecad-pcb.diffBoard', 'Diff Board vs HEAD — the built board\'s visual diff in a panel'],
		['typecad-pcb.refreshBoardData', 'Refresh Board Data — re-read the built board']
	];

	const simulateLoop = `typecad-pcb build       # board + netlist into ./build/
typecad-pcb simulate    # solves the operating point → build/<board>_op.json
# the ngspice + Copper ΔT views light up on the next viewer refresh`;
</script>

<svelte:head>
	<title>The VS Code extension — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="The typeCAD/pcb VS Code extension: pin hovers, a five-view board viewer (Gerber, PCBA, blueprint, ngspice, Copper ΔT), and two-way cross-probing — bundled into every new project."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">The VS Code extension</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	New projects ship with a typeCAD/pcb extension already inside. It displays the compiled board
	alongside your code — hovers on components and nets, a live board viewer with fabrication,
	electrical, and thermal views, and cross-probing in both directions. Nothing to install from the
	marketplace.
</p>

<ApiCard
	name="Installation"
	kind="workflow"
	purpose="`typecad-pcb create` copies the compiled extension into each project's
		`hw/.vscode/extensions/` folder, where VS Code (1.85+) picks it up workspace-scoped — no
		marketplace, no global state. Open the generated workspace file and it's there; open the same
		folder without VS Code and nothing changed."
	imports={"hw/.vscode/extensions/"}>
	{#snippet example()}
		<CodeBlock code={install} label="terminal" />
	{/snippet}
</ApiCard>

<ApiCard
	name="Pin hovers"
	kind="feature"
	purpose="Hover a component variable anywhere in `src/` and the extension shows everything the
		compiled board knows about that part."
	imports={"hover a component variable"}>
	{#snippet example()}
		<DocsTable headers={['On the hover', 'What you see']} rows={hoverFacts} />
	{/snippet}
	<Callout>
		Before the first build there is no board to read — the hover says so and points at
		<code>npm run build</code> instead of showing nothing.
	</Callout>
</ApiCard>

<ApiCard
	name="The board viewer"
	kind="feature"
	purpose="`typeCAD/pcb: View Board` opens a panel rendering the compiled board. A switcher under
		the board title selects one of five views, all sharing one SVG frame — pan/zoom, the ruler,
		DRC markers, search, and cross-probing work in every one of them."
	imports={"typeCAD/pcb: View Board"}>
	{#snippet example()}
		<DocsTable headers={['View', 'What it shows']} rows={views} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Every view</h3>
	<div class="mt-3">
		<DocsTable headers={['Tool', 'What it does']} rows={viewerTools} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="ngspice view"
	kind="feature"
	purpose="The electrical view: white paper, near-black traces, semi-transparent components. It
		comes alive after `typecad-pcb simulate` solves the DC operating point and leaves
		`build/<board>_op.json` beside the netlist — the viewer picks it up like a DRC report."
	imports={"typecad-pcb simulate"}>
	{#snippet example()}
		<CodeBlock code={simulateLoop} label="terminal" />
	{/snippet}
	<div class="mt-3">
		<DocsTable headers={['Layer of the view', 'What you see']} rows={electrical} />
	</div>
	<Callout>
		No simulation run yet? The view still renders — the hover just has no electrical data to
		show. See <a href="/pcb/docs/simulation" class="font-bold text-primary underline">Simulation</a>
		for the API behind it.
	</Callout>
</ApiCard>

<ApiCard
	name="Copper ΔT"
	kind="feature"
	purpose="The thermal view — 'given this operating point, where is the layout thermally
		stressed?' It builds on the same solved currents as the ngspice view; the board stackup
		(`build/<board>_stackup.json`, auto-discovered) feeds per-layer copper weight into the model.
		The board renders as near-monochrome graphite with an incandescent ramp, and zero-current
		copper stays inert."
	imports={"Copper ΔT view"}>
	{#snippet example()}
		<DocsTable headers={['Element', 'How it reads']} rows={thermal} />
	{/snippet}
	<Callout label="Read it as an estimate">
		Copper-loss only, and labeled as such in the legend: external-layer constants throughout, no
		component-surface convection (a part's dissipation is an upper bound conducted in through its
		leads), no enclosure or lateral spreading beyond the solved field, and a routed wire's share
		of current parallel to a pour isn't modeled.
	</Callout>
</ApiCard>

<ApiCard
	name="Blueprint view"
	kind="feature"
	purpose="The board drawn as a fabrication drawing — the same layers as the PCBA render, in ink
		on paper instead of soldermask and silk."
	imports={"blueprint paper"}>
	{#snippet example()}
		<DocsTable headers={['On the drawing', 'What it gives you']} rows={blueprint} />
	{/snippet}
</ApiCard>

<ApiCard
	name="Cross-probing"
	kind="feature"
	purpose="The board, the source, and the diagnostics stay linked in every direction — nets as
		well as components."
	imports={"editor ⇄ board ⇄ problems"}>
	{#snippet example()}
		<DocsTable headers={['Direction', 'How']} rows={crossProbe} />
	{/snippet}
</ApiCard>

<ApiCard
	name="Ambient board state"
	kind="workflow"
	purpose="The addon keeps a live model of the project: what's built, what's stale, and what's
		wrong — the same ambient style as the typeCAD/hal extension."
	imports={"status bar · Problems · CodeLens"}>
	{#snippet example()}
		<DocsTable headers={['Surface', 'What it shows']} rows={ambient} />
	{/snippet}
	<Callout>
		<strong>typeCAD/pcb: Browse Components</strong> is a QuickPick over the compiled board —
		reference, value, footprint, source variable — and zooms the viewer to the pick.
	</Callout>
</ApiCard>

<ApiCard
	name="Stays current"
	kind="workflow"
	purpose="Every `npm run build` re-renders the viewer automatically — the refresh waits for the
		board file to stop changing, so a busy build doesn't flash half-written panels. Viewport,
		layer settings, view, highlights, and an open panel all survive rebuilds and window reloads."
	imports={"npm run build"}>
	<Callout label="How it works">
		The extension does no board analysis itself — it shells out to <code>typecad-pcb query</code>
		(components index and per-component pad tables, both cached) and runs
		<code>typecad-pcb export gerbers</code> / <code>export drill</code> plus the
		<code>gerber-viewer</code> CLI. The netlist, DRC report, stackup, and simulation overlays are
		each optional: a missing artifact drops that overlay instead of failing the render, and
		everything invalidates when <code>build/**/*.kicad_pcb</code> changes.
	</Callout>
	<Callout label="Limits">
		Pads show pad numbers and net names — symbolic pin names live in the schematic, not the board
		file. And the viewer needs a compiled board: until <code>npm run build</code> produces the
		<code>.kicad_pcb</code>, hovers show a build hint.
	</Callout>
</ApiCard>

<ApiCard
	name="Commands"
	kind="reference"
	purpose="All commands live under the typeCAD/pcb category in the command palette."
	imports={"command palette"}>
	{#snippet example()}
		<DocsTable headers={['Command ID', 'Title']} rows={commands} monoCols={[0]} />
	{/snippet}
</ApiCard>

<div class="mt-10 flex items-center justify-between border-t-2 border-foreground pt-6 text-sm">
	<a href="/pcb/docs/pcb" class={buttonVariants({ variant: 'outline' })}>
		Next: The PCB class <ArrowRight class="size-4" />
	</a>
</div>
