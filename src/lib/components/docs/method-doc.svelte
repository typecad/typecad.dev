<script lang="ts">
	interface Param {
		name: string;
		type: string;
		units?: string;
		description: string;
	}

	interface Props {
		name: string;
		signature: string;
		returns?: string;
		params?: Param[];
		children?: import('svelte').Snippet;
	}

	let { name, signature, returns = '', params = [], children }: Props = $props();
</script>

<section class="border-t-2 border-foreground/15 pt-5 first:border-t-0 first:pt-0">
	<h3 class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
		<span class="font-bold text-primary">{name}</span>
		<code class="text-xs text-muted-foreground">{signature}</code>
		{#if returns}
			<span class="text-xs text-muted-foreground">→ {returns}</span>
		{/if}
	</h3>

	{#if params.length}
		<div class="mt-3 overflow-x-auto">
			<table class="w-full border-collapse text-xs">
				<thead>
					<tr class="text-left">
						<th class="border border-foreground/30 bg-muted px-2 py-1.5 font-bold">Parameter</th>
						<th class="border border-foreground/30 bg-muted px-2 py-1.5 font-bold">Type</th>
						<th class="border border-foreground/30 bg-muted px-2 py-1.5 font-bold">Units / values</th>
						<th class="border border-foreground/30 bg-muted px-2 py-1.5 font-bold">Description</th>
					</tr>
				</thead>
				<tbody>
					{#each params as param (param.name)}
						<tr>
							<td class="border border-foreground/30 px-2 py-1.5 font-bold">{param.name}</td>
							<td class="border border-foreground/30 px-2 py-1.5 font-mono">{param.type}</td>
							<td class="border border-foreground/30 px-2 py-1.5">{param.units ?? '—'}</td>
							<td class="border border-foreground/30 px-2 py-1.5">{param.description}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<div class="mt-3 space-y-3 text-sm leading-relaxed">
		{@render children?.()}
	</div>
</section>
