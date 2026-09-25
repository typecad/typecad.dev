<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const runChecks = `import { runERC, runDRC } from '@typecad/pcb';

const erc = await runERC('./build/typecad.kicad_sch');
const drc = await runDRC('./build/typecad.kicad_pcb');
console.log(erc, drc);`;

	const exports_ = `import { exportPCB, exportSchematic } from '@typecad/pcb';

await exportPCB('./build/typecad.kicad_pcb', './build/typecad-top.svg', 'svg');
await exportSchematic('./build/typecad.kicad_sch', './build/typecad-sch.pdf', 'pdf');`;

	const cli = `import { executeKiCADCommand } from '@typecad/pcb';

const version = await executeKiCADCommand('kicad-cli', ['version'], {});
console.log(version);`;

	const config = `import { defineConfig } from '@typecad/pcb';

export default defineConfig({
  entry: 'src/index.ts',
  kicad_cli: '/usr/bin/kicad-cli',
  kicad_path: '/usr/share/kicad',
  use_flatpak: false,
  verbose: false,
});`;

	const functions = [
		['runERC(schPath, options)', 'Electrical rule checks on the schematic — Promise<string>'],
		['runDRC(pcbPath, options)', 'Design rule checks on the board — Promise<string>'],
		['exportPCB(pcbPath, outputPath, format, options?)', 'Export the board — svg, pdf, ...'],
		['exportSchematic(schPath, outputPath, format, options?)', 'Export the schematic — svg, pdf, ...'],
		['executeKiCADCommand(command, args, options)', 'Run any kicad-cli command — Promise<string>'],
		['executeKiCADCommandSync(command, args, options)', 'The synchronous form'],
		['upgradeFootprint(footprintPath, options)', 'Upgrade a footprint file to the current KiCAD version']
	];

	const configOptions = [
		['entry', 'string', 'Path to the TypeScript entry file (relative to hw/)'],
		['kicad_cli', 'string', 'Path to the kicad-cli binary'],
		['kicad_path', 'string', 'Path to the KiCAD installation directory'],
		['use_flatpak', 'boolean', 'Prioritize a Flatpak installation'],
		['verbose', 'boolean', 'Verbose output during builds']
	];
</script>

<svelte:head>
	<title>Checks &amp; Export — typeCAD/pcb docs</title>
	<meta name="description" content="runERC and runDRC check the build, export functions emit SVG/PDF, executeKiCADCommand runs any kicad-cli command." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Checks &amp; Export</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Function-level API for checking the build and getting data out of it. All of these wrap
	<code>kicad-cli</code> — they need a KiCAD installation (auto-detected on Windows, macOS, and
	Linux, including Flatpak; KiCAD 10.0 supported).
</p>

<ApiCard
	name="runERC / runDRC"
	kind="functions"
	purpose="Electrical rule checks on the schematic and design rule checks on the board. Both return
		Promise<string> with the check output; design rules default to the JLCPCB no-surcharge
		standard written into the project."
	imports={"import { runERC, runDRC } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={runChecks} label="checks.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="exportPCB / exportSchematic"
	kind="functions"
	purpose="Export the board or schematic to a file format — svg, pdf, and the other kicad-cli
		export formats."
	imports={"import { exportPCB, exportSchematic } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={exports_} label="export.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="executeKiCADCommand / executeKiCADCommandSync"
	kind="functions"
	purpose="Run any kicad-cli command from TypeScript — the escape hatch the export functions are
		built on. Sync variant returns the string directly."
	imports={"import { executeKiCADCommand } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={cli} label="cli.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All functions</h3>
	<DocsTable headers={['Function', 'Description']} rows={functions} monoCols={[0]} />
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">typecad.conf.ts</h2>
<p class="mt-2 text-sm leading-relaxed">
	Projects are configured with a <code>typecad.conf.ts</code> file in the <code>hw/</code>
	directory — build settings, KiCAD paths, and other options:
</p>
<div class="mt-4">
	<CodeBlock code={config} label="typecad.conf.ts" />
</div>
<div class="mt-4">
	<DocsTable headers={['Option', 'Type', 'Description']} rows={configOptions} monoCols={[0, 1]} />
</div>
<p class="mt-4 text-sm leading-relaxed">
	Run <code>typecad doctor</code> to verify the environment — it checks KiCAD, Node.js, and the
	required tools. Use <code>--fix</code> for automatic fixes and <code>--json</code> for
	machine-readable output.
</p>
