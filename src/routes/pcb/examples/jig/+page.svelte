<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('jig');
	if (!example) error(404, 'Example not found');

	const build = `cd my-project/hw
typecad-pcb build`;
	const outputs = `build/
  dut.kicad_pcb      ← the board under test
  dut.kicad_sch
  jig.kicad_pcb      ← the test jig
  jig.kicad_sch`;
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
			<span class="text-foreground">jig</span>
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
				Two <code>PCB</code> instances in one entry file: <code>dut</code> is the board being
				developed, <code>jig</code> is the fixture that tests it. Each becomes its own set of
				KiCAD files.
			</li>
			<li>
				Test points and pogo pins share the same coordinates — set the jig on top and every pin
				lands on its point. The mounting holes line up for the standoffs.
			</li>
			<li>
				On the DUT, the resistor bridges the two test points, so the jig measures the real part.
			</li>
			<li>
				The pogo pin here is a stand-in <code>Component</code> — generate a real one for your
				hardware with <code>typecad-pcb add component</code> and swap it in.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Build</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<div class="mt-2">
			<CodeBlock code={outputs} label="output" />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/components" class="font-bold text-primary underline">Components</a>
				— TestPoint, MountingHole, and the add-component tool
			</li>
			<li>
				<a href="/pcb/docs/placement" class="font-bold text-primary underline">Placement</a>
				— position parts relative to each other instead of by eye
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
