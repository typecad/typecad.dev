<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';

	interface DocsArea {
		slug: string;
		title: string;
	}

	interface DocsGroup {
		title: string;
		areas: DocsArea[];
	}

	interface NavExtra {
		slug: string;
		title: string;
		href: string;
	}

	interface Props {
		/** scoped theme class: theme-hal | theme-pcb */
		theme: string;
		/** section root, e.g. /hal/docs */
		root: string;
		/** sidebar heading, e.g. "HAL reference" */
		navTitle: string;
		/** breadcrumb label for the section root, e.g. "hal" */
		rootLabel: string;
		/** sidebar categories, in reading order */
		groups: DocsGroup[];
		/** static links shown under the area list (Examples, ...) */
		extras?: NavExtra[];
		children?: import('svelte').Snippet;
	}

	let { theme, root, navTitle, rootLabel, groups, extras = [], children }: Props = $props();

	// flat reading order — drives the prev/next pager and active-link detection
	const areas = $derived(groups.flatMap((g) => g.areas));

	const pathname = $derived(page.url.pathname.replace(/\/+$/, ''));

	const area = $derived(areas.find((a) => `${root}/${a.slug}` === pathname));
	const index = $derived(area ? areas.indexOf(area) : -1);
	const prev = $derived(index > 0 ? areas[index - 1] : undefined);
	const next = $derived(index >= 0 && index < areas.length - 1 ? areas[index + 1] : undefined);

	// --- search deep-link: ?q= scrolls to and highlights the first match ---
	let contentEl: HTMLElement | null = $state(null);
	let marked: HTMLElement | null = null;

	function clearHighlight() {
		if (!marked) return;
		const parent = marked.parentNode;
		if (parent) {
			while (marked.firstChild) parent.insertBefore(marked.firstChild, marked);
			marked.remove();
			parent.normalize();
		}
		marked = null;
	}

	function scrollToFirstMatch(term: string) {
		clearHighlight();
		if (!contentEl || !term) return;
		const lower = term.toLowerCase();

		const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const tag = node.parentElement?.tagName;
				if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
				return node.nodeValue && node.nodeValue.toLowerCase().includes(lower)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_SKIP;
			}
		});
		const textNode = walker.nextNode() as Text | null;
		if (!textNode || textNode.nodeValue === null) return;

		// wrap the first occurrence in a highlight mark (single text node, so
		// surroundContents cannot cross element boundaries)
		const start = textNode.nodeValue.toLowerCase().indexOf(lower);
		const range = document.createRange();
		range.setStart(textNode, start);
		range.setEnd(textNode, start + term.length);
		const mark = document.createElement('mark');
		mark.className = 'search-hit';
		range.surroundContents(mark);
		marked = mark;

		mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	afterNavigate((navigation) => {
		const q = navigation.to?.url.searchParams.get('q');
		if (q) {
			// the new page renders before afterNavigate resolves; one frame for safety
			requestAnimationFrame(() => scrollToFirstMatch(q));
		} else {
			clearHighlight();
		}
	});
</script>

<style>
	/* themed scrollbar — tokens flip with .theme-hal / .theme-pcb */
	.docs-nav {
		scrollbar-width: thin;
		scrollbar-color: var(--foreground) transparent;
	}
	.docs-nav::-webkit-scrollbar {
		width: 10px;
	}
	.docs-nav::-webkit-scrollbar-track {
		background: transparent;
	}
	.docs-nav::-webkit-scrollbar-thumb {
		background: var(--muted);
		border: 2px solid var(--foreground);
	}
	.docs-nav::-webkit-scrollbar-thumb:hover {
		background: var(--foreground);
	}
</style>

<section class="{theme} flex flex-1 flex-col bg-background text-foreground">
	<div
		class="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
		<aside class="hidden lg:block">
			<div
				class="docs-nav sticky top-20 max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-contain pb-4 pr-1">
				<p
					class="text-xs font-bold uppercase tracking-widest text-muted-foreground underline decoration-2 underline-offset-4">
					{navTitle}
				</p>
				<nav class="mt-3 flex flex-col items-stretch gap-0.5">
					<a
						href={root}
						class={cn(
							'border-2 border-transparent px-2 py-1 text-sm transition-colors hover:border-foreground',
							pathname === root ? 'border-foreground bg-muted font-bold' : ''
						)}>
						Overview
					</a>
				</nav>
				{#each groups as group (group.title)}
					<p
						class="mt-4 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground underline decoration-2 underline-offset-4">
						{group.title}
					</p>
					<nav class="mt-1 flex flex-col items-stretch gap-0.5">
						{#each group.areas as a (a.slug)}
							<a
								href="{root}/{a.slug}"
								class={cn(
									'border-2 border-transparent px-2 py-1 text-sm transition-colors hover:border-foreground',
									area?.slug === a.slug ? 'border-foreground bg-muted font-bold' : ''
								)}>
								{a.title}
							</a>
						{/each}
					</nav>
				{/each}
				{#if extras.length}
					<p
						class="mt-4 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground underline decoration-2 underline-offset-4">
						More
					</p>
					<nav class="mt-1 flex flex-col items-stretch gap-0.5">
						{#each extras as e (e.slug)}
							<a
								href={e.href}
								class="border-2 border-transparent px-2 py-1 text-sm transition-colors hover:border-foreground">
								{e.title}
							</a>
						{/each}
					</nav>
				{/if}
			</div>
		</aside>

		<main class="min-w-0" bind:this={contentEl}>
			<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
				<a href="/{rootLabel}" class="hover:text-foreground hover:underline">{rootLabel}</a> /
				<a href={root} class="hover:text-foreground hover:underline">docs</a>
				{#if area}
					/ <span class="text-foreground">{area.title}</span>
				{/if}
			</nav>

			{@render children?.()}

			<div class="mt-12 flex items-center justify-between gap-4 border-t-2 border-foreground pt-6">
				{#if prev}
					<a
						href="{root}/{prev.slug}"
						class={cn(buttonVariants({ variant: 'outline' }), 'flex-col items-start gap-0 h-auto py-2')}>
						<span class="text-xs text-muted-foreground">Previous</span>
						<span>{prev.title}</span>
					</a>
				{:else}
					<span></span>
				{/if}
				{#if next}
					<a
						href="{root}/{next.slug}"
						class={cn(buttonVariants({ variant: 'outline' }), 'flex-col items-end gap-0 h-auto py-2 text-right')}>
						<span class="text-xs text-muted-foreground">Next</span>
						<span>{next.title}</span>
					</a>
				{:else if index === areas.length - 1}
					<a href="/{rootLabel}" class={buttonVariants({ variant: 'outline' })}>Back to {rootLabel}</a>
				{/if}
			</div>
		</main>
	</div>
</section>
