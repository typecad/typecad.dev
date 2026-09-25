<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('import-kicad');
	if (!example) error(404, 'Example not found');

	const importCmd = `typecad-pcb import ./existing-board.kicad_pcb`;
	const applyCmd = `typecad-pcb import ./existing-board.kicad_pcb --apply`;
	const build = `typecad-pcb build`;
</script>

<svelte:head>
	<title>{example.title} — typeCAD/pcb examples</title>
	<meta name="description" content={example.description} />
</svelte:head>

<section class="theme-pcb flex flex-1 flex-col bg-background text-foreground">
	<div class="mx-auto w-full max-w-4xl px-6 py-10">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href="/pcb" class="hover:text-foreground hover:underline">pcb</a> /
			<a href="/pcb/examples" class="hover:text-foreground hover:underline">examples</a> /
			<span class="text-foreground">import-kicad</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">{example.title}</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{example.description}</p>

		<p class="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
			Click through the files — it's the whole project
		</p>
		<div class="mt-2">
			<WorkspaceViewer {example} />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">How this project came to be</h2>

		<h3 class="mt-6 font-bold">1 — Import the board</h3>
		<div class="mt-2">
			<CodeBlock code={importCmd} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed">
			The importer prints the code — placements, tracks as <code>TrackBuilder</code> chains, the
			outline, zones, and a ready <code>create(...)</code> call. Paste it into
			<code>hw/src/index.ts</code>, exactly what the editor above shows.
		</p>

		<h3 class="mt-6 font-bold">2 — Build to confirm the round-trip</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			The regenerated board should match the original. From here the code is the source of
			truth — change values, add parts, re-run the build.
		</p>

		<h3 class="mt-6 font-bold">3 — Keep working in KiCAD? Bring the edits back</h3>
		<div class="mt-2">
			<CodeBlock code={applyCmd} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed">
			<code>--apply</code> matches the board against your source and offers every KiCAD-side
			change — moved parts, text edits — to write back. You choose what lands.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/import" class="font-bold text-primary underline">Import from KiCAD</a>
				— everything the importer covers, and what --apply writes
			</li>
			<li>
				<a href="/pcb/docs/connections" class="font-bold text-primary underline">Connections</a>
				— add nets to the imported board
			</li>
		</ul>

		<div class="mt-12 border-t-2 border-foreground pt-6">
			<a
				href="/pcb/examples"
				class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 text-muted-foreground')}>
				<ArrowLeft class="size-4" /> All examples
			</a>
		</div>
	</div>
</section>
