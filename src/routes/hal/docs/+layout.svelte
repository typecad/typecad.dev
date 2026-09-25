<script lang="ts">
	import DocsShell from '$lib/components/docs/docs-shell.svelte';
	import { HAL_DOC_GROUPS } from '$lib/config/hal-docs';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<DocsShell
	theme="theme-hal"
	root="/hal/docs"
	navTitle="HAL reference"
	rootLabel="hal"
	groups={HAL_DOC_GROUPS}
	extras={[{ slug: 'examples', title: 'Examples', href: '/hal/examples' }]}>
	{@render children?.()}
</DocsShell>
