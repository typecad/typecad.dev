<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const importCmd = `typecad-pcb import ./existing-board.kicad_pcb`;
	const applyCmd = `typecad-pcb import ./existing-board.kicad_pcb --apply --capture-layouts`;

	const covers = [
		['Components', 'Footprint placement — position, rotation, side (front/back)'],
		['Tracks & vias', 'Emitted as TrackBuilder chains and via components'],
		['Zones & keepouts', 'Including grouped fills and rule areas'],
		['Board outline', 'Rectangles, polygons, circles, cutouts'],
		['Stackup', 'Layer count and dielectric data'],
		['Text', 'Board text elements']
	];

	const applySteps = [
		['Position / side changes', 'Footprints that moved in KiCAD update their pcb position in the source'],
		['Text call changes', 'Board text edits sync back as .text() calls'],
		['Layout changes', 'referenceLayout / valueLayout / fabLayout — with --capture-layouts']
	];
</script>

<svelte:head>
	<title>Import from KiCAD — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="typecad-pcb import converts an existing .kicad_pcb into typeCAD TypeScript — and --apply syncs KiCAD layout edits back into your source."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Import from KiCAD</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Existing designs aren't a dead end. <code>typecad-pcb import</code> reads a
	<code>.kicad_pcb</code> and prints the equivalent typeCAD code — and with <code>--apply</code>,
	it writes KiCAD-side layout edits back into your source files.
</p>

<ApiCard
	name="import"
	kind="command"
	purpose="Converts a KiCAD board into typeCAD TypeScript. Without flags it prints the code for you
		to paste; variable names come from each footprint's Code property, falling back to the
		KiCAD reference."
	imports={"typecad-pcb import <file.kicad_pcb>"}>
	{#snippet example()}
		<CodeBlock code={importCmd} label="terminal" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">What gets imported</h3>
	<DocsTable headers={['Content', 'How it arrives']} rows={covers} />
	<Callout>
		The output ends with a ready <code>create(...)</code> call listing everything imported —
		paste it into a source file and build to confirm the round-trip.
	</Callout>
</ApiCard>

<ApiCard
	name="import --apply"
	kind="command"
	purpose="The round-trip: match the imported board against your project's source files and write
		KiCAD-side edits back. Selective — an interactive checklist shows every change before it's
		applied."
	imports={"typecad-pcb import <file.kicad_pcb> --apply"}>
	{#snippet example()}
		<CodeBlock code={applyCmd} label="terminal" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		The importer locates the project's source, matches each footprint to the line that created
		it, and offers the differences it found:
	</p>
	<DocsTable headers={['Change in KiCAD', 'What --apply writes']} rows={applySteps} />
	<p class="mt-3 text-sm leading-relaxed">
		Tracks, vias, and zones are always shown for manual copy — <code>--apply</code> never
		rewrites those into your source unasked.
	</p>
	<Callout label="Workflow">
		Do the final visual layout pass in KiCAD, then pull the placement work back into the code
		with one command. The board file stays generated; the source stays the source of truth.
	</Callout>
</ApiCard>
