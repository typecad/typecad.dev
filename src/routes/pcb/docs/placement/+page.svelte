<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const coordinates = `import { PCB, Component } from '@typecad/pcb';

let pcb = new PCB('typecad_docs');
pcb.outline(0, 0, 60, 45);

let u1 = new Component({ footprint: '...' });
u1.pcb = { x: 10, y: 20, rotation: 90 };`;

	const boardBounds = `let u1 = new Component({ footprint: '...' });
u1.pcb = { x: b.center.x, y: b.center.y };   // center of the board`;

	const edgeRelative = `import { PCB, Component } from '@typecad/pcb';

let pcb = new PCB('typecad_docs');
pcb.outline(0, 0, 60, 45);
const b = pcb.board;

let u1 = new Component({ footprint: '...' });
u1.pcb = { x: b.center.x, y: b.center.y };`;

	const directional = `r2.pcb = { x: 10, y: pcb.board.below(r1).by(3) };   // 3 mm below r1's courtyard
mh1.pcb = { ...pcb.board.centered() };              // centered on the board`;

	const liveArithmetic = `let r2 = new Component({ footprint: '...' });
r2.pcb = {
  x: pcb.board.sameAs(r1).x.plus(2),   // follow r1 at create() time
  y: pcb.board.below(r1),
};`;

	const boundsProps = [
		['center', '{ x, y } center point (centers the component\'s origin)'],
		['centered()', '{ x, y } placement values that center the component\'s occupied box — rotation- and origin-aware'],
		['left, right, top, bottom', 'Edge coordinates in mm'],
		['width, height', 'Board dimensions in mm'],
		['topLeft, topRight, bottomLeft, bottomRight', 'Corner coordinates'],
		['fromLeft(n), fromRight(n), fromTop(n), fromBottom(n)', 'A fixed distance in from that edge']
	];

	const relationalVerbs = [
		['below(c) / above(c)', 'Place below/above component c'],
		['rightOf(c) / leftOf(c)', 'Place right/left of component c'],
		['sameAs(c)', 'Follow component c\'s position'],
		['.by(n)', 'Override the default gap (mm)'],
		['.plus(n) / .minus(n)', 'Live arithmetic on deferred values — returns a new deferred value']
	];
</script>

<svelte:head>
	<title>Placement — typeCAD/pcb docs</title>
	<meta name="description" content="Place components with mm coordinates or relative to each other and the board edges — courtyard-edge gaps, live deferred values resolved at create()." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Placement</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Instead of hard-coding millimeter coordinates, use the placement helpers to position components
	relative to each other and the board edges. All gaps are measured <strong>courtyard edge to
	courtyard edge</strong>.
</p>

<ApiCard
	name="component.pcb"
	kind="property"
	purpose="The position of a component on the board. Assign an object with x, y (mm from the origin)
		and optional rotation (degrees) — or any of the deferred placement values from pcb.board."
	imports={"import { Component } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={coordinates} label="coordinates.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="pcb.board"
	kind="property"
	purpose="The board's physical dimensions, read live from the outlines you've defined. Usable
		before or after pcb.outline() — values follow the final outline. Placement values are live
		and order-independent: every deferred expression is re-resolved at create() against final
		positions."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={boardBounds} label="board-bounds.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">BoardBounds</h3>
	<DocsTable headers={['Property', 'Description']} rows={boundsProps} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Edge-relative placement</h3>
	<CodeBlock code={edgeRelative} label="edge-relative.ts" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Relational verbs</h3>
	<p class="text-sm leading-relaxed">
		All placement lives on <code>pcb.board</code> — one namespace, no separate imports:
	</p>
	<div class="mt-3">
		<DocsTable headers={['Verb', 'Description']} rows={relationalVerbs} monoCols={[0]} />
	</div>
	<CodeBlock code={directional} label="directional.ts" class="mt-3" />

	<MethodDoc name="live arithmetic" signature="value.plus(n) / value.minus(n)">
		<p>
			Placement values support live arithmetic — <code>.plus(n)</code>/<code>.minus(n)</code> return
			new deferred values, so expressions follow their source at <code>create()</code>:
		</p>
		<CodeBlock code={liveArithmetic} label="live.ts" class="mt-3" />
	</MethodDoc>

	<Callout>
		Assign positions in any order — <code>pcb.board</code> reads before the outline exists,
		<code>r2</code> below <code>r1</code> before <code>r1</code> moves — and the relationships
		still hold. Manually moving a component after assigning an expression freezes that axis: the
		manual value wins.
	</Callout>
</ApiCard>
