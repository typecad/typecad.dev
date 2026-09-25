<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('first-board');
	if (!example) error(404, 'Example not found');

	const create = `npx typecad-pcb create`;
	const build = `cd my-project/hw
typecad-pcb build`;
	const output = `build/
  first_board.kicad_pcb
  first_board.kicad_sch
  first_board.net
  first_board.csv   ← the BOM`;
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
			<span class="text-foreground">first-board</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">{example.title}</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{example.description}</p>

		<p class="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
			Click through the files — it's the whole project
		</p>
		<div class="mt-2">
			<WorkspaceViewer {example} />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">The whole flow</h2>

		<h3 class="mt-6 font-bold">1 — Create the project</h3>
		<div class="mt-2">
			<CodeBlock code={create} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed">
			Answer the prompts — no firmware project or extra packages are needed for this board — then open
			the generated <code>.code-workspace</code> file in VSCode.
		</p>

		<h3 class="mt-6 font-bold">2 — Write the board</h3>
		<p class="mt-2 text-sm leading-relaxed">
			Open <code>hw/src/index.ts</code> and replace the starter with the board from the editor
			above. That's the entire design: two resistors sized with <code>size</code>, three named
			nets wired with <code>net()</code>, a board outline, and placements. The build turns it
			into a KiCAD project.
		</p>

		<h3 class="mt-6 font-bold">3 — Build</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			The build runs the entry file and writes the KiCAD outputs into <code>./build/</code>. You
			can also click the build script in VSCode's NPM Scripts sidebar.
		</p>

		<h3 class="mt-6 font-bold">4 — Open it in KiCAD</h3>
		<p class="mt-2 text-sm leading-relaxed">
			Everything the board needs is in <code>build/</code> — open the PCB file in KiCAD for the
			final visual layout pass:
		</p>
		<div class="mt-2">
			<CodeBlock code={output} label="output" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			The schematic, netlist, and BOM all agree with the code, because they all come from it.
			Change a value — <code>'10kohm'</code> to <code>'4.7kohm'</code> — rebuild, and every
			output updates.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/passives" class="font-bold text-primary underline">Passives</a>
				— resistors, capacitors, LEDs, and more, packaged by size
			</li>
			<li>
				<a href="/pcb/docs/connections" class="font-bold text-primary underline">Connections</a>
				— everything <code>net()</code> can do, including named nets and power rails
			</li>
			<li>
				<a href="/pcb/docs/placement" class="font-bold text-primary underline">Placement</a>
				— position parts relative to each other and the board edges instead of hard-coded mm
			</li>
			<li>
				<a href="/pcb/docs/getting-started" class="font-bold text-primary underline">Getting started</a>
				— installing the requirements, if you haven't yet
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
