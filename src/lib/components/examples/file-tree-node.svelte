<script lang="ts">
	import type { WorkspaceNode } from '$lib/workspace-examples';
	import { ChevronRight, ChevronDown, FileText } from '@lucide/svelte';
	import Self from './file-tree-node.svelte';

	interface Props {
		node: WorkspaceNode;
		activePath?: string;
		depth?: number;
		onselect: (path: string) => void;
	}

	let { node, activePath, depth = 0, onselect }: Props = $props();

	let open = $state(true);
	const indent = $derived(0.5 + depth * 0.875);
</script>

{#if node.type === 'folder'}
	<button
		type="button"
		class="flex w-full items-center gap-1 px-2 py-1 text-left text-xs hover:bg-foreground/10"
		style="padding-left: {indent}rem"
		onclick={() => (open = !open)}>
		{#if open}
			<ChevronDown class="size-3.5 shrink-0 opacity-70" />
		{:else}
			<ChevronRight class="size-3.5 shrink-0 opacity-70" />
		{/if}
		<span class="truncate font-bold">{node.name}</span>
	</button>
	{#if open}
		{#each node.children as child (child.path)}
			<Self node={child} {activePath} depth={depth + 1} {onselect} />
		{/each}
	{/if}
{:else}
	{@const fileIndent = 0.5 + (depth + 1) * 0.875}
	<button
		type="button"
		class="flex w-full items-center gap-1 px-2 py-1 text-left text-xs {activePath === node.path
			? 'bg-primary text-primary-foreground'
			: 'hover:bg-foreground/10'}"
		style="padding-left: {fileIndent}rem"
		onclick={() => onselect(node.path)}>
		<FileText class="size-3.5 shrink-0 opacity-70" />
		<span class="truncate">{node.name}</span>
	</button>
{/if}
