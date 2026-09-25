<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	const createProject = `npx typecad-pcb create`;
	const createFlags = `npx typecad-pcb create --name=typecad_project --git=false --hal=false`;
	const build = `typecad-pcb build`;
	const addComponent = `typecad-pcb add component`;
	const doctor = `typecad-pcb doctor`;

	const requirements = [
		['KiCAD', 'version 10.0 — required', 'kicad.org'],
		['npm / Node.js', 'version 20 or later — required', 'nodejs.org'],
		['Visual Studio Code', 'Not required, but highly recommended — new projects bundle the typeCAD/pcb extension (board viewer, pin hovers)', 'code.visualstudio.com'],
		['typeCAD/hal', 'Optional — firmware projects scaffolded by create use it', 'typecad.dev/hal/docs'],
		['git', 'Optional — used for version control features; keep git in your PATH', 'git-scm.com'],
		['ngspice', 'Optional — used for circuit simulations, see the Simulation page', 'ngspice.sourceforge.io']
	];

	const structure = [
		['hw/', 'The project directory — build commands run from here'],
		['hw/src/index.ts', 'The TypeScript entry file your board is defined in'],
		['hw/typecad.conf.ts', 'Optional build configuration (entry, KiCAD paths, verbosity)'],
		['build/', 'Generated output — .kicad_pcb, .kicad_sch, .net, and BOM .csv']
	];

	const cli = [
		['create', 'Scaffold a new project (interactive, or fully scripted with flags)'],
		['build', 'Run the entry file and generate the KiCAD outputs into ./build/'],
		['add component', 'Generate a component .ts file from KiCAD, a local file, or JLCPCB'],
		['add package', 'Scaffold a reusable, publishable typeCAD package'],
		['search', 'Fuzzy-search the KiCAD symbol libraries'],
		['import', 'Convert an existing .kicad_pcb file into typeCAD TypeScript'],
		['diff', 'Visually diff two KiCAD PCB files, netlists, and BOMs'],
		['doc', 'Generate HTML documentation from Markdown and PCB files'],
		['doctor', 'Verify the environment; --fix attempts automatic fixes'],
		['validate', 'Check source code without a full build'],
		['drc / erc', 'Run KiCAD\'s design and electrical rule checks'],
		['--json / --help / --version', 'Global options on every command']
	];
</script>

<svelte:head>
	<title>Getting started — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Install the requirements, create a typeCAD/pcb project with the CLI, and open it in VSCode."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🧰 Getting started</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	typeCAD/pcb designs circuit boards in TypeScript: you write code, and the build produces a KiCAD
	project — board, schematic, netlist, and BOM — that you open in KiCAD for the final visual layout
	pass.
</p>

<ApiCard
	name="🧰 Requirements"
	kind="checklist"
	purpose="Make sure your system has the required software. KiCAD and Node.js are the only hard
		requirements; everything else is optional depending on how you work."
	imports="KiCAD 10.0 · Node.js 20+">
	{#snippet example()}
		<DocsTable headers={['Software', 'Notes', 'Link']} rows={requirements} linkCols={[2]} />
	{/snippet}
		<Callout>
			<code>git</code> must be in your PATH — typeCAD optionally uses it in its tooling. Run
			<code>typecad-pcb doctor</code> at any time to verify the whole environment; use
			<code>--fix</code> to attempt automatic fixes.
		</Callout>
</ApiCard>

<ApiCard
	name="📦 Create a project"
	kind="command"
		purpose="One command scaffolds a project. You'll be prompted for the project name, whether to
			also scaffold a typeCAD/hal firmware project (and its board target), whether to create a
			git repository, and which optional utility packages to install."
	imports={"npm install -g @typecad/pcb"}>
	{#snippet example()}
		<CodeBlock code={createProject} label="terminal" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The project is created in the current directory, including a VSCode workspace file — open it
		and the project comes up ready to work. All the prompts can also be passed as flags:
	</p>
	<CodeBlock code={createFlags} label="non-interactive" class="mt-3" />
	<MethodDoc name="--help" signature="typecad-pcb create --help">
		<p>Lists every parameter for scripted project creation.</p>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="➡️ Build"
	kind="command"
	purpose="Builds the project: runs the TypeScript entry file and generates the KiCAD outputs into
		./build/. Run it from the hw/ directory, or click the build script in VSCode's NPM Scripts
		sidebar."
	imports={"typecad-pcb build"}>
	{#snippet example()}
		<CodeBlock code={build} label="terminal" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Project layout</h3>
	<div class="mt-3">
		<DocsTable headers={['Path', 'What it is']} rows={structure} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="🧩 VSCode"
	kind="workflow"
	purpose="Not required, but the recommended editor. The generated workspace file opens the project
		with everything wired up — including the bundled typeCAD/pcb extension, installed
		workspace-scoped so it never touches your global setup. It adds pin hovers, a board viewer
		panel with Gerber and assembled-board views, and click-through cross-probing between board
		and source. The NPM Scripts sidebar also exposes the CLI as clickable scripts — build and
		Add Component are the two you'll use constantly."
	imports="workspace file · NPM Scripts · typeCAD/pcb extension">
	{#snippet example()}
		<CodeBlock code={addComponent} label="add a component" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		What the extension gives you day-to-day — hovers, viewer, cross-probing — is covered on
		<a href="/pcb/docs/vscode" class="font-bold text-primary underline">The VS Code extension</a> page.
	</p>
	<p class="text-sm leading-relaxed">
		<code>add component</code> asks for the symbol/footprint source — the installed KiCAD library,
		a local file, or an EasyEDA/JLCPCB <code>C###</code> part — then generates a typed
		<code>[component].ts</code> file with usage instructions. There's no need to add passives
		(resistors, capacitors, etc.) this way — they come from
		<a href="/pcb/docs/passives" class="font-bold text-primary underline">@typecad/passives</a>.
	</p>
</ApiCard>

<ApiCard
	name="⌨️ The CLI"
	kind="reference"
	purpose="All commands are accessed through the `typecad-pcb` binary that ships with `@typecad/pcb`.
		Every command supports `--json` for machine-readable output, `--help` for usage, and `--version`."
	imports={"typecad-pcb <command>"}>
	{#snippet example()}
		<DocsTable headers={['Command', 'What it does']} rows={cli} monoCols={[0]} />
	{/snippet}
	<Callout>
		New project? This page plus
		<a href="/pcb/docs/pcb" class="font-bold text-primary underline">The PCB class</a> and
		<a href="/pcb/docs/components" class="font-bold text-primary underline">Components</a> cover
		the whole first day: create, build, add parts, connect pins. Full flag tables for every
		command live on the <a href="/pcb/docs/cli" class="font-bold text-primary underline">CLI</a>
		page.
	</Callout>
</ApiCard>

<div class="mt-10 flex items-center justify-between border-t-2 border-foreground pt-6 text-sm">
	<a href="/pcb/docs/vscode" class={buttonVariants({ variant: 'outline' })}>
		Next: The VS Code extension <ArrowRight class="size-4" />
	</a>
</div>

<p class="mt-6 text-sm text-muted-foreground">
	Something here unclear or out of date?
	<a
		href="https://github.com/typecad/typecad"
		target="_blank"
		rel="noreferrer"
		class="font-bold text-primary underline hover:no-underline">
		Open an issue
	</a>
	— we'd rather hear about it.
</p>
