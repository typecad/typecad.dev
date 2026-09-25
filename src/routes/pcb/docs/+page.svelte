<script lang="ts">
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { PCB_DOC_GROUPS } from '$lib/config/pcb-docs';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	const quickstart = `import { PCB } from '@typecad/pcb';
let typecad = new PCB('typecad');
typecad.create();`;

	const kicadFlow = [
		['1', 'Create a project with a schematic and board'],
		['2', 'Add components'],
		['3', 'Make connections'],
		['4', 'Layout the board']
	];

	const typecadFlow = [
		['1', 'Create a typeCAD project'],
		['2', 'Edit the code to add components and make connections'],
		['3', 'Build it'],
		['4', 'Open the board in KiCAD for the final visual layout pass']
	];
</script>

<svelte:head>
	<title>pcb reference — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Programmatically create hardware: write TypeScript, build it into a KiCAD project. The typeCAD/pcb API in the card format."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🧰 typeCAD/pcb reference</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Instead of using the KiCAD schematic editor, you write TypeScript code and build it into a KiCAD
	project. typeCAD replaces steps 1–3 of the KiCAD flow — placing components and making connections
	happens in code, not by clicking and dragging.
</p>

<h2 class="mt-10 text-2xl font-bold tracking-tight">The smallest board</h2>
<div class="mt-4">
	<CodeBlock code={quickstart} label="typecad.ts" />
</div>
<p class="mt-3 text-sm leading-relaxed">
	That creates a KiCAD board file, schematic file, netlist, and BOM in <code>./build/</code> —
	<code>typecad.kicad_pcb</code>, <code>typecad.kicad_sch</code>, <code>typecad.net</code>, and
	<code>typecad.csv</code>. Run <code>typecad build</code> from your project's <code>hw/</code>
	directory to build; a <code>typecad.conf.ts</code> file there configures it.
</p>

<h2 class="mt-10 text-2xl font-bold tracking-tight">The flow</h2>
<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
	<div class="border-2 border-foreground bg-card p-4 shadow-sm">
		<p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">KiCAD</p>
		<ol class="ml-4 mt-2 list-decimal space-y-1 text-sm">
			{#each kicadFlow as [n, step] (n)}
				<li>{step}</li>
			{/each}
		</ol>
	</div>
	<div class="border-2 border-foreground bg-card p-4 shadow-sm">
		<p class="text-xs font-bold uppercase tracking-widest text-muted-foreground">typeCAD</p>
		<ol class="ml-4 mt-2 list-decimal space-y-1 text-sm">
			{#each typecadFlow as [n, step] (n)}
				<li>{step}</li>
			{/each}
		</ol>
	</div>
</div>
<p class="mt-4 text-sm leading-relaxed">
	Design rules (minimum clearances, track/via dimensions) default to the JLCPCB no-surcharge
	standard and are written to the project file for DRC — see
	<a href="/pcb/docs/board-layout" class="font-bold text-primary underline">Board Layout</a>. You
	only need to open KiCAD for the final visual layout pass.
</p>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Areas</h2>
{#each PCB_DOC_GROUPS as group, gi (group.title)}
	<p class="mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground underline decoration-2 underline-offset-4">
		{group.title}
	</p>
	<div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
		{#each group.areas as a (a.slug)}
			<a
				href="/pcb/docs/{a.slug}"
				class="group border-2 border-foreground bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5">
				<span class="flex items-center gap-1.5 font-bold">
					{a.title}
					<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
				</span>
				<span class="mt-1 block text-sm text-muted-foreground">{a.blurb}</span>
			</a>
		{/each}
		{#if gi === 0}
			<a
				href="/pcb/examples"
				class="group border-2 border-foreground bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5">
				<span class="flex items-center gap-1.5 font-bold">
					Examples
					<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
				</span>
				<span class="mt-1 block text-sm text-muted-foreground">
					Complete projects you can copy — boards, routing, exports
				</span>
			</a>
		{/if}
	</div>
{/each}

<div class="mt-12 border-t-2 border-foreground pt-6">
	<a href="/pcb/docs/getting-started" class={buttonVariants({ size: 'lg' })}>
		Get started <ArrowRight class="size-4" />
	</a>
	<p class="mt-6 text-sm text-muted-foreground">
		Something wrong or missing?
		<a
			href="https://github.com/typecad/typecad"
			target="_blank"
			rel="noreferrer"
			class="font-bold text-primary underline hover:no-underline">
			Open an issue
		</a>
		— we'd rather hear about it.
	</p>
</div>
