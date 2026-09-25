<script lang="ts">
	import { X } from '@lucide/svelte';

	interface Props {
		openFiles: { path: string; name: string }[];
		activePath?: string;
		onactivate: (path: string) => void;
		onclose: (path: string) => void;
	}

	let { openFiles, activePath, onactivate, onclose }: Props = $props();
</script>

<div class="flex overflow-x-auto border-b border-white/10 bg-[#252526]">
	{#each openFiles as file (file.path)}
		<div
			class="group flex shrink-0 items-center gap-1.5 border-r border-white/10 px-3 py-1.5 text-xs
				{activePath === file.path
				? 'border-t-2 border-t-primary bg-[#1e1e1e] text-zinc-100'
				: 'text-zinc-400'}">
			<button type="button" class="font-mono" onclick={() => onactivate(file.path)}>
				{file.name}
			</button>
			<button
				type="button"
				aria-label="Close {file.name}"
				class="opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100"
				onclick={() => onclose(file.path)}>
				<X class="size-3" />
			</button>
		</div>
	{/each}
</div>
