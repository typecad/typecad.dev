<script lang="ts">
	// A rendered UI screenshot (scripts/ui-shots → static/hal/ui). Images are
	// pre-scaled with nearest-neighbor, so keep them pixelated in the browser.
	interface Shot {
		src: string;
		alt: string;
		label?: string;
		/** CSS width in px. Defaults to 320 — a 320 px panel at 1:1, which is
		 *  pixel-exact on 2× screens since the PNGs are rendered at 2×. */
		width?: number;
	}

	interface Props {
		shots: Shot[];
		caption?: string;
		class?: string;
	}

	let { shots, caption = '', class: className = '' }: Props = $props();
</script>

<figure class="mt-4 {className}">
	<div class="flex flex-wrap items-start gap-4">
		{#each shots as shot (shot.src)}
			<div class="max-w-full">
				<img
					src={shot.src}
					alt={shot.alt}
					loading="lazy"
					class="block h-auto max-w-full border-2 border-foreground shadow-sm"
					style="image-rendering: pixelated; width: {shot.width ?? 320}px;" />
				{#if shot.label}
					<p class="mt-1 font-mono text-xs text-muted-foreground">{shot.label}</p>
				{/if}
			</div>
		{/each}
	</div>
	<figcaption class="mt-2 text-xs text-muted-foreground">
		{#if caption}{caption} · {/if}rendered with <code>typecad-hal preview</code>'s engine
	</figcaption>
</figure>
