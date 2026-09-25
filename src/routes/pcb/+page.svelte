<script lang="ts">
	import { ArrowRight, Braces, GitMerge, Hexagon, Sparkles } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const benefits = [
		{
			icon: Braces,
			title: 'Code',
			description: 'Write TypeScript instead of clicking and dragging in a GUI.'
		},
		{
			icon: GitMerge,
			title: 'git',
			description: 'Real version control — meaningful diffs, reviews, and CI/CD for hardware.'
		},
		{
			icon: Hexagon,
			title: 'Package',
			description: 'npm and Node.js to install, update, shrinkwrap, and publish your designs.'
		},
		{
			icon: Sparkles,
			title: 'Automate',
			description: "It's all code — scripts, custom tools, and AI assistants can help write the board."
		}
	];
</script>

<svelte:head>
	<title>typeCAD/pcb — design circuit boards in TypeScript</title>
	<meta
		name="description"
		content="Programmatically create hardware: write TypeScript code and build it into a KiCAD project."
	/>
</svelte:head>

<section class="theme-pcb flex flex-1 flex-col bg-background text-foreground">
	<div class="container flex flex-col items-center gap-4 py-20 text-center">
		<span
			class="border-2 border-foreground bg-background px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
			hardware
		</span>
		<h1 class="text-5xl font-bold tracking-tight">typeCAD<span class="text-primary">/pcb</span></h1>
		<p class="max-w-xl text-lg text-muted-foreground">
			🤖 programmatically 💥 create 🛰️ hardware — write TypeScript code and build it into a KiCAD
			project.
		</p>
		<div class="mt-2 flex flex-wrap items-center justify-center gap-3">
			<a href="/pcb/docs" class={buttonVariants({ size: 'lg' })}>
				Get started <ArrowRight class="size-4" />
			</a>
			<a
				href="https://github.com/typecad/typecad"
				target="_blank"
				rel="noreferrer"
				class={buttonVariants({ variant: 'outline', size: 'lg' })}>
				github/typecad
			</a>
		</div>
	</div>

	<div class="container grid grid-cols-1 gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
		{#each benefits as benefit (benefit.title)}
			<Card.Root class="border-2 border-foreground shadow-md">
				<Card.Header>
					<benefit.icon class="size-8 text-primary" />
					<Card.Title class="text-xl">{benefit.title}</Card.Title>
				</Card.Header>
				<Card.Content class="text-sm text-muted-foreground">
					{benefit.description}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="container flex flex-col items-center gap-3 pb-20 text-center">
		<h2 class="text-2xl font-bold">The whole schematic, as code</h2>
		<p class="max-w-xl text-sm text-muted-foreground">
			Import parts, wire them together, and export a KiCAD project you can lay out and
			manufacture. Design rules live next to the design — check them in CI like any other code.
		</p>
		<a href="/pcb/docs" class="text-sm font-bold text-primary underline hover:no-underline">
			Browse the pcb reference →
		</a>
		<a href="/pcb/examples" class="text-sm text-primary underline hover:no-underline">
			Browse examples →
		</a>
		<p class="max-w-xl text-sm text-muted-foreground">
			We use pcb on our own boards — and hal for their firmware. Something needs work?
			<a
				href="https://github.com/typecad/typecad"
				target="_blank"
				rel="noreferrer"
				class="font-bold text-primary underline hover:no-underline">
				open an issue
			</a>
			— we'd rather hear about it.
		</p>
	</div>
</section>
