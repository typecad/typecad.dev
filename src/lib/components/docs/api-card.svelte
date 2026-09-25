<script lang="ts">
	interface Props {
		/** symbol name, e.g. GPIO */
		name: string;
		/** kind chip: class / function / directive */
		kind?: string;
		/** one line: what it's for and when you reach for it */
		purpose: string;
		/** import statement shown as a chip in the card header */
		imports?: string;
		/** runnable example — rendered before any signature */
		example?: import('svelte').Snippet;
		/** members: method docs, tables, callouts */
		children?: import('svelte').Snippet;
	}

	let { name, kind = 'class', purpose, imports = '', example, children }: Props = $props();

	// purpose supports `backtick` spans for inline code (escaped first, so the
	// html injection is limited to the code wrapper we add ourselves)
	const purposeHtml = $derived(
		purpose
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/`([^`]+)`/g, '<code>$1</code>')
	);
</script>

<section class="mt-10 border-2 border-foreground bg-card shadow-sm">
	<header class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-foreground px-5 py-3">
		<span class="bg-primary px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
			{kind}
		</span>
		<h2 class="text-xl font-bold">{name}</h2>
		{#if imports}
			<code class="ml-auto hidden text-xs text-muted-foreground sm:inline">{imports}</code>
		{/if}
	</header>

	<div class="px-5 py-5">
		<p class="text-sm leading-relaxed [&_code]:bg-muted [&_code]:px-1">{@html purposeHtml}</p>

		{#if example}
			<p class="mt-5 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
				Example first
			</p>
			{@render example()}
		{/if}

		<div class="mt-6">
			{@render children?.()}
		</div>
	</div>
</section>
