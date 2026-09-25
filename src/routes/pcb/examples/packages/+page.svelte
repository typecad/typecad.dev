<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('packages');
	if (!example) error(404, 'Example not found');

	const install = `cd my-project/hw
npm install @typecad/rd-bq24210`;
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
			<span class="text-foreground">packages</span>
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
				<code>@typecad/rd-bq24210</code> is a published package implementing TI's BQ24210 solar
				charger — IC, passives, and the connecting tracks, tested as a unit.
			</li>
			<li>
				<code>npm install</code> brings its symbols and footprints along; the build syncs them
				into <code>./build/lib/</code> so KiCAD finds everything.
			</li>
			<li>
				The panel and battery are <code>Connector</code>s wrapped in <code>Power</code> objects —
				wiring them to <code>charger.U1</code> is ordinary <code>net()</code> work, and the
				power-aware checks see the voltages.
			</li>
			<li>
				<code>charger.components</code> is everything the package placed — spread it into
				<code>create()</code> and the whole sub-circuit lands in the outputs, grouped together.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Install</h3>
		<div class="mt-2">
			<CodeBlock code={install} label="terminal" />
		</div>

		<h3 class="mt-6 font-bold">Build</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			In KiCAD, the charger arrives as one group — drag it around the board and route to it like
			any other part.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/packages" class="font-bold text-primary underline">Packages</a>
				— the full consuming story, constructor options, and DNP
			</li>
			<li>
				<a href="/pcb/docs/package-authoring" class="font-bold text-primary underline">Package authoring</a>
				— publish your own circuit modules
			</li>
			<li>
				<a href="/pcb/docs/pins-power" class="font-bold text-primary underline">Pins &amp; Power</a>
				— the Power class behind the panel and battery
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
