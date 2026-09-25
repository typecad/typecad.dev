<script lang="ts">
	import { listNews } from '$lib/news';

	const articles = listNews();
</script>

<svelte:head>
	<title>News — typeCAD</title>
	<meta name="description" content="News and release notes from typeCAD." />
</svelte:head>

<div class="mx-auto w-full max-w-3xl px-6 py-10">
	<h1 class="text-4xl font-bold tracking-tight">📰 News</h1>
	<p class="mt-3 leading-relaxed text-muted-foreground">
		Release notes and announcements for typeCAD/pcb and typeCAD/hal.
	</p>

	<div class="mt-8 flex flex-col gap-4">
		{#each articles as article (article.slug)}
			<a
				href="/news/{article.slug}"
				class="group border-2 border-foreground bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
				<span class="flex flex-wrap items-baseline gap-x-3">
					<span class="text-lg font-bold group-hover:text-primary">{article.title}</span>
					<span class="text-xs text-muted-foreground">{article.dateFormatted}</span>
				</span>
				<span class="mt-2 block text-sm leading-relaxed text-muted-foreground">
					{article.description}
				</span>
			</a>
		{:else}
			<p class="text-sm text-muted-foreground">Nothing here yet.</p>
		{/each}
	</div>
</div>
