<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const fileVsFile = `typecad-pcb diff original.kicad_pcb modified.kicad_pcb`;
	const gitWorking = `typecad-pcb diff HEAD ./build/typecad_concepts.kicad_pcb`;
	const gitRevRev = `typecad-pcb diff v1.0 v1.1 -- ./build/typecad_concepts.kicad_pcb`;
	const flags = [
		['--full', 'Include all layers — the standard set otherwise (User layers off)'],
		['--theme=<name>', 'KiCAD SVG plot theme for the renders (default: KiCAD\u2019s)'],
		['--output=<path>', 'HTML destination — default gitdiff-results.html next to the modified file']
	];

	const report = [
		['Layer renders', 'Every copper layer side by side — the HTML viewer offers side-by-side, overlay, onion-skin, diff-only, and swipe views'],
		['Netlist diff', 'Nets added, removed, and re-pinned between the two boards'],
		['BOM diff', 'Parts added, removed, changed, with values and footprints'],
		['Textual diff', 'The raw board file differences']
	];

	const programmatic = `import { KiCAD } from '@typecad/pcb';
import { generateDiffs } from '@typecad/pcb/diff';

new KiCAD();

let html = await generateDiffs({
  originalFile: 'original.kicad_pcb',
  modifiedFile: 'modified.kicad_pcb',
  fullMode: false,
  theme: 'KiCAD Default',
});`;
</script>

<svelte:head>
	<title>Git diff — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="typecad-pcb diff renders visual board comparisons — file vs file, git revision vs working tree — with netlist and BOM diffing in one HTML report."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Git diff</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Boards are text, so git already diffs them — but a line-level diff of a
	<code>.kicad_pcb</code> tells you nothing. <code>typecad-pcb diff</code> renders two boards
	against each other: layer images to eyeball, plus netlist and BOM deltas, in one HTML report.
</p>

<ApiCard
	name="diff"
	kind="command"
	purpose="Three ways to call it: two files, a git revision against the working tree, or two git
		revisions. Git forms extract the board from history with git show — no stash, no checkout."
	imports={"typecad-pcb diff <a> <b>"}>
	{#snippet example()}
		<CodeBlock code={fileVsFile} label="file vs file" />
		<CodeBlock code={gitWorking} label="revision vs working tree" class="mt-2" />
		<CodeBlock code={gitRevRev} label="revision vs revision" class="mt-2" />
	{/snippet}
	<DocsTable headers={['Flag', 'Meaning']} rows={flags} monoCols={[0]} />
	<Callout>The report opens in your browser automatically when it's ready.</Callout>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">What's in the report</h3>
	<DocsTable headers={['Section', 'Content']} rows={report} />
</ApiCard>

<ApiCard
	name="generateDiffs"
	kind="function"
	purpose="The same comparison from code — build it into CI, a pre-merge check, or your own
		tooling. Requires KiCAD initialized first."
	imports={"import { generateDiffs } from '@typecad/pcb/diff'"}>
	{#snippet example()}
		<CodeBlock code={programmatic} label="diff.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Returns the written HTML file's path. <code>fullMode</code> and <code>theme</code> mirror
		the CLI flags.
	</p>
</ApiCard>
