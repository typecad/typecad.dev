<script lang="ts">
	import DocsShell from '$lib/components/docs/docs-shell.svelte';
	import { PCB_DOC_GROUPS } from '$lib/config/pcb-docs';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<DocsShell
	theme="theme-pcb"
	root="/pcb/docs"
	navTitle="pcb reference"
	rootLabel="pcb"
	groups={PCB_DOC_GROUPS}
	extras={[{ slug: 'examples', title: 'Examples', href: '/pcb/examples' }]}>
	{@render children?.()}
</DocsShell>
