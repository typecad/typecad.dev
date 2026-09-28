<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('auto-route');
	if (!example) error(404, 'Example not found');

	const build = `cd my-project/hw
npx @typecad/pcb build`;
	const drc = `npx typecad-pcb drc

  [DRC] 12 checks passed, 0 violations`;
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
			<span class="text-foreground">auto-route</span>
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
				No hard-coded millimeters: the connector is 4 mm in from the left edge, the resistor sits
				right of it, the LED follows the resistor, and the bleed resistor drops below the LED.
				Gaps are courtyard edge to courtyard edge.
			</li>
			<li>
				Every net is built with <code>named()</code> and passed to <code>route()</code> — the
				router connects each one, choosing layers and dropping vias per the board's via policy.
			</li>
			<li>
				Trace width and clearance aren't in the file because they come from the board's design
				rules — the JLCPCB no-surcharge standard unless you change them.
			</li>
			<li>
				When the router picks something you don't like, override the net:
				<code>typecad.route(net, &#123; width: 0.5 &#125;)</code>, or route it by hand with
				<code>track()</code> instead.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Build and check</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<div class="mt-2">
			<CodeBlock code={drc} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Open the board in the VS Code board viewer to see the routes — click copper to light up a
			net and check the router's work.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/routing" class="font-bold text-primary underline">Routing</a>
				— route options, powerInfo widths, and the manual TrackBuilder
			</li>
			<li>
				<a href="/pcb/docs/placement" class="font-bold text-primary underline">Placement</a>
				— the relational verbs and live arithmetic used in this file
			</li>
			<li>
				<a href="/pcb/docs/board-layout" class="font-bold text-primary underline">Board Layout</a>
				— where the default width and clearance come from
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
