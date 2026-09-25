<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	import type { WorkspaceFile } from '$lib/workspace-examples';

	interface Props {
		file: WorkspaceFile;
	}

	let { file }: Props = $props();

	// Break the path into breadcrumb segments: my-project › src › main.ts
	let crumbs = $derived(file.path.split('/'));

	let copied = $state(false);
	async function copySource() {
		const host = document.getElementById('vscode-code-host');
		const text = host?.querySelector('code')?.textContent ?? '';
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard unavailable — nothing to do
		}
	}
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<!-- Breadcrumb + copy -->
	<div
		class="flex items-center justify-between border-b border-white/10 bg-[#1e1e1e] px-4 py-1.5 text-xs text-zinc-400">
		<nav class="flex items-center gap-1 overflow-x-auto font-mono">
			{#each crumbs as crumb, i}
				{#if i > 0}<span class="text-zinc-600">›</span>{/if}
				<span class={i === crumbs.length - 1 ? 'text-zinc-100' : ''}>{crumb}</span>
			{/each}
		</nav>
		<button
			type="button"
			onclick={copySource}
			class="flex shrink-0 items-center gap-1 border border-zinc-700 px-2 py-0.5 text-zinc-400 transition-colors hover:border-zinc-400 hover:text-zinc-100"
			aria-label="Copy file contents">
			{#if copied}
				<Check class="size-3.5 text-primary" />
				<span class="text-primary">Copied</span>
			{:else}
				<Copy class="size-3.5" />
				<span>Copy</span>
			{/if}
		</button>
	</div>

	<!-- Shiki HTML is generated at build time from our own sources -->
	<div id="vscode-code-host" class="vscode-pane min-w-0 flex-1 overflow-auto">
		{@html file.html}
	</div>
</div>

<style>
	/* Shiki emits class="shiki" — scoped here so the markdown/other code styles
	   never collide. All selectors :global() because the HTML arrives via
	   {@html}. VSCode-dark colors are deliberate: this pane simulates the
	   editor itself. */
	:global(.vscode-pane .shiki) {
		background-color: #1e1e1e !important;
		margin: 0;
		padding: 0.5rem 0;
		counter-reset: vscode-line;
	}

	:global(.vscode-pane .shiki .line) {
		position: relative;
		padding: 0 1rem 0 3.25rem;
		white-space: pre;
		line-height: 1.5;
	}

	:global(.vscode-pane .shiki .line::before) {
		counter-increment: vscode-line;
		content: counter(vscode-line) !important;
		position: absolute;
		left: 0;
		width: 2.25rem;
		text-align: right;
		color: #6e7681;
		user-select: none;
	}

	:global(.vscode-pane .shiki code) {
		font-family: var(--font-mono, ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace);
		font-size: 13px;
		display: block;
		background: transparent !important;
	}
</style>
