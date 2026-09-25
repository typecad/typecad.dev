<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Command from '$lib/components/ui/command';
	import { Button } from '$lib/components/ui/button';
	import Search from '@lucide/svelte/icons/search';

	interface SearchResult {
		title: string;
		href: string;
		content: string;
		preview: string;
		section: 'pcb' | 'hal';
	}

	type ScoredResult = SearchResult & { score: number; contextualPreview: string };

	let open = $state(false);
	let searchQuery = $state('');
	let index: SearchResult[] = $state([]);
	let loading = $state(false);

	const section = $derived(page.url.pathname.startsWith('/pcb') ? 'pcb' : 'hal');

	let loadedSection: string | null = null;
	async function loadIndex() {
		if (loadedSection === section) return;
		loading = true;
		try {
			const response = await fetch(`/api/search?section=${section}`);
			if (response.ok) {
				index = await response.json();
				loadedSection = section;
			}
		} catch (error) {
			console.error('Failed to load search data:', error);
		} finally {
			loading = false;
		}
	}

	// lazy-load the section index the first time the dialog opens
	$effect(() => {
		if (open) loadIndex();
	});

	const filteredResults = $derived.by(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return [];
		if (query.length > 100) return [];
		// only unescaped special chars — nothing to match on
		if (/^[(){}[\]\\^$|*+?]+$/.test(query)) return [];

		const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		let wordBoundary: RegExp, startsWith: RegExp;
		try {
			wordBoundary = new RegExp(`\\b${escaped}\\b`, 'i');
			startsWith = new RegExp(`\\b${escaped}`, 'i');
		} catch {
			return index.filter(
				(r) => r.title.toLowerCase().includes(query) || r.content.toLowerCase().includes(query)
			).slice(0, 8).map((r) => ({ ...r, score: 1, contextualPreview: r.preview }));
		}

		return index
			.map((result) => {
				const title = result.title.toLowerCase();
				const content = result.content.toLowerCase();
				const href = result.href.toLowerCase();

				let score = 0;
				if (title === query) score += 100;
				else if (startsWith.test(title)) score += 50;
				else if (wordBoundary.test(title)) score += 20;
				if (wordBoundary.test(href)) score += 15;
				if (wordBoundary.test(content)) score += 5;
				if (score === 0 && content.includes(query)) score += 1;

				let contextualPreview = result.preview;
				const match = wordBoundary.exec(result.content);
				if (match) {
					const start = Math.max(0, match.index - 50);
					const end = Math.min(result.content.length, match.index + query.length + 50);
					let excerpt = result.content.slice(start, end);
					if (start > 0) excerpt = '...' + excerpt;
					if (end < result.content.length) excerpt = excerpt + '...';
					contextualPreview = excerpt;
				}

				return { ...result, score, contextualPreview };
			})
			.filter((r) => r.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 8);
	});

	function handleSelect(result: SearchResult) {
		open = false;
		const q = searchQuery.trim();
		searchQuery = '';
		// carry the term so the docs shell can scroll to + highlight the first match
		goto(q ? `${result.href}?q=${encodeURIComponent(q)}` : result.href);
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				open = !open;
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<Button
	variant="outline"
	size="sm"
	class="gap-2 text-muted-foreground"
	onclick={() => (open = true)}>
	<Search class="size-4" />
	<span class="hidden md:inline">Search {section} docs</span>
	<kbd
		class="hidden pointer-events-none md:inline-flex h-5 select-none items-center gap-1 border border-muted-foreground/40 px-1 font-mono text-[10px] font-bold">
		⌘K
	</kbd>
</Button>

<Command.Dialog
	shouldFilter={false}
	bind:open
	title={`Search ${section} docs`}
	class="sm:max-w-lg">
	<Command.Input placeholder={`Search ${section} documentation...`} bind:value={searchQuery} />
	<Command.List>
		{#if loading}
			<Command.Loading>Loading...</Command.Loading>
		{:else if filteredResults.length === 0}
			<Command.Empty>
				{searchQuery.trim() ? 'No results found.' : 'Start typing to search...'}
			</Command.Empty>
		{:else}
			<Command.Group heading="Results">
				{#each filteredResults as result (result.href)}
					<Command.Item
						value={`${result.title} ${result.href}`}
						onSelect={() => handleSelect(result)}
						class="cursor-pointer gap-2 p-2">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="truncate font-medium">{result.title}</span>
								<span class="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
									{result.section}
								</span>
							</div>
							<p class="truncate text-sm text-muted-foreground">{result.contextualPreview}</p>
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
