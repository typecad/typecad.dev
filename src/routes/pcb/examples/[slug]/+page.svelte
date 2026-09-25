<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data }: { data: import('./$types').PageData } = $props();

	const example = $derived(data.example);
</script>

<svelte:head>
	<title>{example.title} — typeCAD/pcb examples</title>
	<meta name="description" content={example.description} />
</svelte:head>

<section class="theme-pcb flex flex-1 flex-col bg-background text-foreground">
	<div class="mx-auto w-full max-w-3xl px-6 py-10">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href="/pcb" class="hover:text-foreground hover:underline">pcb</a> /
			<a href="/pcb/examples" class="hover:text-foreground hover:underline">examples</a> /
			<span class="text-foreground">{example.title}</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">{example.title}</h1>

		<div class="article mt-8 border-t-2 border-foreground pt-8">
			{@html example.html}
		</div>

		<div class="mt-12 border-t-2 border-foreground pt-6">
			<a
				href="/pcb/examples"
				class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 text-muted-foreground')}>
				<ArrowLeft class="size-4" /> All examples
			</a>
		</div>
	</div>
</section>
