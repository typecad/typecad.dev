<script lang="ts">
	interface Props {
		/** label: Gotcha, Note, Tip... */
		label?: string;
		children?: import('svelte').Snippet;
	}

	let { label = 'Gotcha', children }: Props = $props();
</script>

<aside class="border-2 border-foreground bg-background px-4 py-3 text-sm shadow-sm">
	<p class="mb-1 font-bold uppercase tracking-widest">{label}</p>
	<div class="leading-relaxed">{@render children?.()}</div>
</aside>
