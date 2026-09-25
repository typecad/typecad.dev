<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('multilayer-board');
	if (!example) error(404, 'Example not found');

	const build = `cd my-project/hw
typecad-pcb build`;
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
			<span class="text-foreground">multilayer-board</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">{example.title}</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{example.description}</p>

		<p class="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
			Click through the files — it's the whole project
		</p>
		<div class="mt-2">
			<WorkspaceViewer {example} />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">What's going on</h2>
		<ul class="ml-6 mt-3 list-disc space-y-2 text-sm leading-relaxed">
			<li>
				<code>layers: 4</code> in the constructor declares the copper; <code>stackup(4, ...)</code>
				finishes it — ENIG, dielectric constraints on for impedance work, and one prepreg
				thickness overridden from the JLCPCB defaults.
			</li>
			<li>
				<code>plane()</code> reserves In1.Cu for ground and In2.Cu for 3V3. Planes are off-limits
				to the router — signals stay on the outer layers.
			</li>
			<li>
				The signal trace asks the stackup what width hits 50 Ω ± 5 on F.Cu with
				<code>impedanceWidth()</code>.
			</li>
			<li>
				<code>stitch('GND')</code> fences the board edge with ground vias; <code>teardrops()</code>
				reinforces everything the router placed.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Build</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Open <code>build/four_layer.kicad_pcb</code> in KiCAD — the stackup editor shows the
			dielectric table, the planes are there as filled zones, and DRC runs against the JLCPCB
			default rules.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/board-layout" class="font-bold text-primary underline">Board Layout</a>
				— stackup, planes, impedance, stitching, and teardrops in full
			</li>
			<li>
				<a href="/pcb/docs/routing" class="font-bold text-primary underline">Routing</a>
				— route options and the impedance constraint
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
