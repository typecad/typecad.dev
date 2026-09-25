<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const commands = [
		['create', 'Scaffold a new project (interactive, or scripted with flags)'],
		['build', 'Run the entry file and generate the KiCAD outputs into ./build/'],
		['add component', 'Generate a component .ts file from KiCAD, a local file, or JLCPCB'],
		['add package', 'Scaffold a reusable, publishable typeCAD package'],
		['search', 'Fuzzy-search the KiCAD symbol libraries'],
		['import', 'Convert an existing .kicad_pcb into typeCAD TypeScript'],
		['diff', 'Visually diff two boards — files or git revisions'],
		['doc', 'Render Markdown + a board into an HTML document'],
		['validate', 'Type-check and run the entry file without a full build'],
		['erc / drc', "Run KiCAD's electrical and design rule checks"],
		['check', 'Build + unconnected pins + ERC + DRC in one pass, one report'],
		['diagnostics', 'Board report: power tree, BOM, ERC/DRC summary'],
		['query', 'Ask a built board questions — nets, components, power'],
		['edit', 'Small edits to a built board — connect, move, route'],
		['export gerbers / drill', 'Fabrication outputs via kicad-cli'],
		['skills', 'AI-assistant skill packs for coding with typeCAD'],
		['package', 'Browse and install typeCAD packages from npm'],
		['doctor', 'Verify the environment; --fix attempts automatic fixes'],
		['clean', 'Remove generated build output']
	];

	const createFlags = [
		['--name=<name>', 'Project name'],
		['--hal=<true|false>', 'Also scaffold a typeCAD/hal firmware project (default false)'],
		['--git=<true|false>', 'Initialize a git repository (default false)'],
		['--yes', 'Accept defaults — needs --name for fully non-interactive use']
	];

	const buildFlags = [
		['[entry]', 'Optional entry file override'],
		['--watch, -w', 'Rebuild on file changes'],
		['--outDir <dir>', 'Output directory (default ./build/)'],
		['--skip-erc / --skip-drc', 'Leave out one check'],
		['--diagnostics', 'Write a Markdown board report (--out=<file.md> names it)'],
		['--verbose', 'Chatty output']
	];

	const addComponentFlags = [
		['--symbol_source=<kicad|local|jlcpcb>', 'Where the symbol comes from'],
		['--footprint_source=<kicad|local|jlcpcb>', 'Where the footprint comes from — can differ from the symbol source'],
		['--symbol= / --footprint=', 'KiCAD library paths for --kicad'],
		['--c=<C###>', 'JLCPCB part number for --jlcpcb'],
		['--folder=<path>', 'Output directory (default: current directory)']
	];

	const searchFlags = [
		['<query>', 'Fuzzy match against the KiCAD symbol libraries'],
		['--format=<detailed|compact|table|json>', 'Output style (default detailed)'],
		['--sort=<score|id|manufacturer|package>', 'Result ordering (default score)'],
		['--limit=<n>', 'Result count (default 5)']
	];

	const checkFlags = [
		['erc / drc [path]', 'One check; the board/schematic is auto-detected from ./build/'],
		['erc/drc --json', '{ passed, errors, warnings, ... } — exit code 1 on any failure'],
		['check [entry]', 'build → unconnected → ERC → DRC, one report, non-zero exit on failure'],
		['diagnostics [entry | .kicad_pcb]', 'Board report to --out=<file.md> (--skip-build, --skip-erc, --skip-drc)'],
		['doctor', 'Environment check — Node, config, kicad-cli, libraries, Git; --fix repairs, --json for CI'],
		['validate [entry]', 'Type-check and execute the entry without generating files']
	];

	const automationFlags = [
		['query summary|nets|net <name>|components|component <ref>|unconnected|power', 'Read a built board — --json for machines'],
		['edit connect <a> <b> [...]', 'Add a connection — pins as R1.1, nets by name'],
		['edit move <ref> --to x,y | --left-of <ref> [--gap mm]', 'Move a part — relative placement included'],
		['edit route <from> <to> [--width mm] [--layers F.Cu,B.Cu]', 'Route a pair; --dry-run previews, --file targets a source file'],
		['export gerbers | export drill -o <dir>', 'Fabrication outputs (default ./build/gerbers/)'],
		['skills list | get <name> | search <query> | export', 'AI skill packs — --out defaults to .claude/skills']
	];

	const jsonSnippet = `typecad-pcb drc --json
typecad-pcb query unconnected --json`;
</script>

<svelte:head>
	<title>The CLI — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Every typecad-pcb command and its flags: create, build, add, search, import, diff, doc, checks, query, edit, export, and skills."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">The CLI</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Everything ships through the <code>typecad-pcb</code> binary that comes with
	<code>@typecad/pcb</code>. Every command takes <code>--json</code> for machine-readable output,
	<code>--help</code> for usage, and <code>--version</code>. Flags accept
	<code>--flag=value</code> or <code>--flag value</code>.
</p>

<ApiCard
	name="commands"
	kind="reference"
	purpose="The full command list. Click through the sections below for the flags that matter per
		group."
	imports={"typecad-pcb <command>"}>
	{#snippet example()}
		<DocsTable headers={['Command', 'What it does']} rows={commands} monoCols={[0]} />
	{/snippet}
</ApiCard>

<ApiCard
	name="create / build"
	kind="reference"
	purpose="Project creation and the build loop. Build writes .kicad_pcb, .kicad_sch, .net, and the
		BOM .csv into ./build/."
	imports={"typecad-pcb create · typecad-pcb build"}>
	{#snippet example()}
		<DocsTable headers={['create flag', 'Meaning']} rows={createFlags} monoCols={[0]} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">build flags</h3>
	<div class="mt-3">
		<DocsTable headers={['Flag', 'Meaning']} rows={buildFlags} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="add component / search"
	kind="reference"
	purpose="Finding parts and generating their class files. Passives never need this — they're
		built in. See Passives."
	imports={"typecad-pcb add component · typecad-pcb search"}>
	{#snippet example()}
		<DocsTable headers={['add component flag', 'Meaning']} rows={addComponentFlags} monoCols={[0]} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">search</h3>
	<div class="mt-3">
		<DocsTable headers={['Flag', 'Meaning']} rows={searchFlags} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="checks"
	kind="reference"
	purpose="Validation at every level: type-check the source, run the KiCAD rule checks, or produce
		a full board report. The JSON shapes are stable — checks are CI-friendly."
	imports={"typecad-pcb erc · drc · check · diagnostics · doctor · validate"}>
	{#snippet example()}
		<DocsTable headers={['Command', 'Behavior']} rows={checkFlags} monoCols={[0]} />
	{/snippet}
	<CodeBlock code={jsonSnippet} label="terminal" class="mt-3" />
</ApiCard>

<ApiCard
	name="query / edit / export / skills"
	kind="reference"
	purpose="Working with built boards: read them, nudge them, fabricate them, and hand AI assistants
		the manuals."
	imports={"typecad-pcb query · edit · export · skills"}>
	{#snippet example()}
		<DocsTable headers={['Command', 'Behavior']} rows={automationFlags} monoCols={[0]} />
	{/snippet}
	<Callout>
		<code>edit</code> modifies a source file in place (or previews with <code>--dry-run</code>) —
		it's how small layout tweaks learned in KiCAD get back into the code without hand-editing
		coordinates. For a full round-trip see
		<a href="/pcb/docs/import" class="font-bold text-primary underline">Import from KiCAD</a>.
	</Callout>
</ApiCard>
