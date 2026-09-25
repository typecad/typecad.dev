<script lang="ts">
	interface Props {
		headers: string[];
		rows: string[][];
		/** column indexes rendered in the mono font */
		monoCols?: number[];
		/** column indexes whose cell text is an external host — rendered as a link */
		linkCols?: number[];
	}

	let { headers, rows, monoCols = [], linkCols = [] }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class="w-full border-collapse text-xs">
		<thead>
			<tr class="text-left">
				{#each headers as header, i (i)}
					<th class="border border-foreground/30 bg-muted px-2 py-1.5 font-bold">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, r (r)}
				<tr>
					{#each row as cell, c (c)}
						<td
							class="border border-foreground/30 px-2 py-1.5 {monoCols.includes(c)
								? 'font-mono'
								: ''}">
							{#if linkCols.includes(c) && cell.includes('.')}
								<a
									href={'https://' + cell}
									target="_blank"
									rel="noreferrer"
									class="font-bold text-primary underline hover:no-underline">
									{cell}
								</a>
							{:else}
								{cell}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
