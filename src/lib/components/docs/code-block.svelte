<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		code: string;
		label?: string;
		class?: string;
	}

	let { code, label = '', class: className }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		await navigator.clipboard.writeText(code);
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1500);
	}
</script>

<div class={cn('border-2 border-foreground bg-zinc-950 shadow-sm', className)}>
	<div class="flex items-center justify-between border-b-2 border-zinc-800 px-3 py-1">
		<span class="text-xs text-zinc-400">{label}</span>
		<button
			onclick={copy}
			class="border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400 transition-colors
				hover:border-zinc-400 hover:text-zinc-100">
			{copied ? 'copied!' : 'copy'}
		</button>
	</div>
	<pre class="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-100"><code>{code}</code></pre>
</div>
