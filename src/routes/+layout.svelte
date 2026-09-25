<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import SiteSearch from '$lib/components/site-search.svelte';

	let { children } = $props();

	const year = new Date().getFullYear();

	// wordmark takes the product's identity on its routes: green for pcb, red for hal
	const isPcb = $derived(page.url.pathname.startsWith('/pcb'));
	const product = $derived(isPcb ? 'pcb' : 'hal');
	const accent = $derived(
		isPcb ? 'text-[oklch(0.7919_0.2124_148.45)]' : 'text-primary'
	);
	const swatch = $derived(
		isPcb ? 'bg-[oklch(0.7919_0.2124_148.45)]' : 'bg-primary'
	);
</script>

<svelte:head>
	<title>typeCAD — code-defined electronics</title>
	<meta
		name="description"
		content="typeCAD builds electronics with code: typeCAD/pcb designs circuit boards from TypeScript, typeCAD/hal generates the firmware that runs them."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background font-sans text-foreground">
	{#if page.url.pathname !== '/'}
			<header class="sticky top-0 z-50 border-b-2 border-foreground bg-background">
				<div class="container flex h-14 items-center justify-end sm:justify-between">
					<a
						href="/"
						class="hidden items-center gap-2 font-bold sm:flex">
						<span
							class="inline-block size-5 border-2 border-foreground shadow-[3px_3px_0_0_hsl(0_0%_0%/1)] {swatch}"></span>
						type<span class={accent}>CAD/{product}</span>
					</a>
					<nav class="flex items-center gap-1 text-sm font-medium">
						<a
							href="/pcb"
							class={cn(
								'border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground',
								page.url.pathname.startsWith('/pcb') ? 'border-foreground' : ''
							)}>
							pcb
						</a>
						<a
							href="/hal"
							class={cn(
								'border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground',
								page.url.pathname.startsWith('/hal') ? 'border-foreground' : ''
							)}>
							hal
						</a>
						<a
							href="/news"
							class={cn(
								'border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground',
								page.url.pathname.startsWith('/news') ? 'border-foreground' : ''
							)}>
							news
						</a>
						{#if !page.url.pathname.startsWith('/news')}
							<span class="ml-1"><SiteSearch /></span>
						{/if}
					</nav>
				</div>
			</header>
	{/if}

	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>

	<footer class="border-t-2 border-foreground bg-background">
		<div
			class="container flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
			<span>© {year} typeCAD — code-defined electronics</span>
				<span class="flex items-center gap-4">
					<a href="https://github.com/typecad" target="_blank" rel="noreferrer" class="hover:text-foreground">github</a>
				</span>
		</div>
	</footer>
</div>
