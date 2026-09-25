<script lang="ts">
	import FileTreeNode from './file-tree-node.svelte';
	import EditorTabs from './editor-tabs.svelte';
	import EditorPane from './editor-pane.svelte';
	import type { WorkspaceExample, WorkspaceFile, WorkspaceFolder, WorkspaceNode } from '$lib/workspace-examples';

	let { example }: { example: WorkspaceExample } = $props();

	// Flatten the tree into a path → node lookup so selecting/opening a file
	// is O(1) regardless of depth.
	let filesByPath = $derived(new Map<string, WorkspaceFile>(collectFiles(example.tree)));

	let openPaths = $state<string[]>([]);
	let activePath = $state<string | undefined>(undefined);

	let openFiles = $derived(
		openPaths
			.map((p) => filesByPath.get(p))
			.filter((f): f is WorkspaceFile => Boolean(f))
			.map((f) => ({ path: f.path, name: f.name }))
	);
	let activeFile = $derived(activePath ? filesByPath.get(activePath) : undefined);

	function collectFiles(
		node: WorkspaceFolder,
		out: Array<[string, WorkspaceFile]> = []
	): Array<[string, WorkspaceFile]> {
		for (const child of node.children as WorkspaceNode[]) {
			if (child.type === 'file') out.push([child.path, child]);
			else collectFiles(child as WorkspaceFolder, out);
		}
		return out;
	}

	function openFile(path: string) {
		if (!openPaths.includes(path)) {
			const next = [...openPaths, path];
			if (next.length > 8) next.shift();
			openPaths = next;
		}
		activePath = path;
	}

	function closeFile(path: string) {
		const idx = openPaths.indexOf(path);
		const next = openPaths.filter((p) => p !== path);
		openPaths = next;
		if (activePath === path) {
			activePath = next[Math.min(idx, next.length - 1)] ?? next[0];
		}
	}

	// Open the first file so the pane isn't empty on first view (SSR-safe).
	$effect(() => {
		if (activePath === undefined && filesByPath.size > 0) {
			const first = [...filesByPath.values()][0];
			openFile(first.path);
		}
	});
</script>

<!-- Simulated VSCode window, site chrome: square corners, hard borders -->
<div class="overflow-hidden border-2 border-foreground shadow-sm">
	<!-- Title bar -->
	<div class="flex items-center gap-2 border-b-2 border-foreground bg-muted px-3 py-1.5">
		<span class="inline-block size-3 border border-foreground bg-red-600"></span>
		<span class="inline-block size-3 border border-foreground bg-yellow-400"></span>
		<span class="inline-block size-3 border border-foreground bg-green-600"></span>
		<span class="ml-2 truncate font-mono text-xs text-muted-foreground">
			{example.title} — Visual Studio Code
		</span>
	</div>

	<div class="grid grid-cols-1 lg:h-[65vh] lg:grid-cols-[220px_1fr]">
		<!-- Explorer -->
		<aside
			class="max-h-[50vh] overflow-y-auto border-b-2 border-foreground bg-muted p-1 lg:h-full lg:max-h-none lg:border-b-0 lg:border-r-2">
			<div
				class="px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
				Explorer — {example.tree.name}
			</div>
			{#each example.tree.children as node (node.path)}
				<FileTreeNode {node} {activePath} onselect={openFile} />
			{/each}
		</aside>

		<!-- Editor -->
		<div class="flex h-full min-h-[50vh] flex-col bg-[#1e1e1e] lg:min-h-0">
			{#if openFiles.length}
				<EditorTabs
					{openFiles}
					{activePath}
					onactivate={(p: string) => (activePath = p)}
					onclose={closeFile}
				/>
			{/if}
			{#if activeFile}
				<EditorPane file={activeFile} />
			{:else}
				<div class="flex flex-1 items-center justify-center text-sm text-zinc-500">
					Select a file from the explorer
				</div>
			{/if}
		</div>
	</div>

	<!-- Status bar -->
	<div
		class="flex items-center justify-between border-t-2 border-foreground bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
		<span>{example.board}</span>
		<span>{example.tags.join(' · ')}</span>
	</div>
</div>
