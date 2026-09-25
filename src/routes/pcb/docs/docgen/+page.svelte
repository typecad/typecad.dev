<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const docCmd = `typecad-pcb doc ./board-docs.md ./build/typecad_concepts.kicad_pcb`;
	const docFlags = [
		['-o, --output <file>', 'HTML destination (default: the markdown file with an .html extension)'],
		['-v, --verbose', 'Chatty output'],
		['-q, --quiet', 'Errors only'],
		['--no-open', "Don't open the result in the browser"]
	];

	const directives = `## Layers

![{F.Cu,B.Cu}](images/copper.png =600)

## 3D render

![{Render/top/0/0/0}](images/render.png =400)

## Fabrication

![{Drill}](images/drill.png)
![{Stackup}](images/stackup.svg)`;

	const directiveTable = [
		['{F.Cu,B.Cu}', 'KiCAD layer plot — comma-separated layer list, any copper or technical layers'],
		['{Render/top/x/y/z}', '3D render — side (top/bottom/...) plus rotation angles'],
		['{Drill}', 'Drill map'],
		['{Stackup}', 'Layer stackup diagram'],
		['=600 / =50%', 'Sizing suffix on any image — pixels or percent width']
	];

	const frontmatter = `---
title: Solar Charger
company: typeCAD
board_name: solar_charger
variant: rev-b
revision: 1.2
---

# Solar Charger

Design notes, test results, and the layer renders below.`;

	const frontmatterKeys = [
		['title / company / board_name / variant / revision', 'Header facts rendered onto the document'],
		['filename', 'Overrides the displayed board filename'],
		['date', 'ISO date — defaults to today'],
		['highlight', 'Shiki highlight theme for code blocks (default github-light)'],
		['kicad_theme', 'Theme for KiCAD layer renders (default KiCAD Default)'],
		['stylesheet', 'Extra CSS for the output'],
		['dark_mode', 'Dark document styling (default false)']
	];
</script>

<svelte:head>
	<title>DocGen — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="typecad-pcb doc turns Markdown plus a .kicad_pcb into a self-updating HTML document with layer renders, 3D views, drill maps, and the stackup."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">DocGen</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Documentation that rebuilds with the board. Write Markdown, reference the board with image
	directives, and <code>typecad-pcb doc</code> renders layer plots, 3D views, drill maps, and the
	stackup straight from the <code>.kicad_pcb</code> into one HTML file.
</p>

<ApiCard
	name="doc"
	kind="command"
	purpose="Renders a Markdown file against a board file. Standard Markdown plus GitHub alerts,
		task lists, code highlighting, and math all work — the image directives are the pcb
		addition."
	imports={"typecad-pcb doc <markdown> <pcb>"}>
	{#snippet example()}
		<CodeBlock code={docCmd} label="terminal" />
	{/snippet}
	<DocsTable headers={['Flag', 'Meaning']} rows={docFlags} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Image directives</h3>
	<p class="text-sm leading-relaxed">
		An image whose alt text is a brace directive becomes a live render of the board:
	</p>
	<CodeBlock code={directives} label="board-docs.md" class="mt-2" />
	<DocsTable headers={['Directive', 'Render']} rows={directiveTable} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Frontmatter</h3>
	<CodeBlock code={frontmatter} label="frontmatter" class="mt-2" />
	<DocsTable headers={['Key', 'Purpose']} rows={frontmatterKeys} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="generateDocumentation"
	kind="function"
	purpose="The renderer from code — for docs pipelines and CI."
	imports={"import { generateDocumentation } from '@typecad/pcb/docgen'"}>
	{#snippet example()}
		<CodeBlock
			code={`import { generateDocumentation } from '@typecad/pcb/docgen';

await generateDocumentation(
  './board-docs.md',
  './build/solar_charger.kicad_pcb',
  './board-docs.html',
  { quiet: true },
);`}
			label="docgen.ts" />
	{/snippet}
</ApiCard>
