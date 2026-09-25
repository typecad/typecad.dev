<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data }: { data: import('./$types').PageData } = $props();

	const article = $derived(data.article);
</script>

<svelte:head>
	<title>{article.title} — typeCAD news</title>
	<meta name="description" content={article.description} />
</svelte:head>

<article class="mx-auto w-full max-w-3xl px-6 py-10">
	<a
		href="/news"
		class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 text-muted-foreground')}>
		<ArrowLeft class="size-4" /> All news
	</a>

	<h1 class="mt-6 text-4xl font-bold tracking-tight">{article.title}</h1>
	<p class="mt-2 text-sm text-muted-foreground">{article.dateFormatted}</p>

	<div class="article mt-8 border-t-2 border-foreground pt-8">
		{@html article.html}
	</div>
</article>
