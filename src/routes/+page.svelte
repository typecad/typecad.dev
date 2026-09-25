<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button';

	const HALVES = [
		{
			href: '/pcb',
			theme: 'theme-pcb',
			name: 'typeCAD/pcb',
			tag: 'hardware',
			pitch: 'Design circuit boards in TypeScript.',
			points: [
				'Code instead of clicking and dragging in a GUI',
				'git for meaningful version control and CI/CD',
				'npm to install, update, and publish designs'
			],
			cta: 'Build a board'
		},
		{
			href: '/hal',
			theme: 'theme-hal',
			name: 'typeCAD/hal',
			tag: 'firmware',
			pitch: 'Write Zephyr in TypeScript.',
			points: [
				'Every pin, bus, and part as a TypeScript object',
				'Transpiles to clean C++ that runs on the board',
				'Tests execute on real hardware from one command'
			],
			cta: 'Write firmware',
			// right half carries the nav in its own header strip
			headerSlot: 'nav'
		}
	];
</script>

<div class="flex flex-1 flex-col md:flex-row">
	{#each HALVES as half (half.href)}
		<div
			class="{half.theme} group relative flex flex-1 flex-col border-foreground bg-background px-6 pb-16 pt-4 text-foreground text-center transition-[flex-grow] duration-200 md:min-h-[calc(100vh-5rem)] md:border-r-2 md:last:border-r-0 md:hover:grow-[1.1]">
			<!-- stretched link: the whole half is clickable -->
			<a href={half.href} aria-label={half.name} class="absolute inset-0 z-10"></a>

			{#if half.headerSlot === 'nav'}
				<nav class="relative z-20 mb-auto flex self-end gap-1 text-sm font-medium">
					<span class="border-2 border-transparent px-3 py-1.5 opacity-60">pcb</span>
					<span class="border-2 border-foreground px-3 py-1.5">hal</span>
					<a
						href="/news"
						class="border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground">
						news
					</a>
					<a
						href="https://github.com/typecad"
						target="_blank"
						rel="noreferrer"
						class="border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground">
						github
					</a>
				</nav>
			{/if}

			<div class="relative mt-10 flex flex-1 flex-col items-center gap-6 md:justify-center">
				<div class="flex flex-col items-center gap-2">
					<span
						class="border-2 border-foreground bg-background px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
						{half.tag}
					</span>
					<h2 class="text-4xl font-bold tracking-tight md:text-5xl">{half.name}</h2>
				</div>

				<p class="max-w-md text-lg text-muted-foreground">{half.pitch}</p>

				<ul class="w-full max-w-md space-y-2 text-left text-sm">
					{#each half.points as point}
						<li class="border-2 border-foreground bg-card px-3 py-2 shadow-sm">
							{point}
						</li>
					{/each}
				</ul>

				<span class="{buttonVariants({ variant: 'default', size: 'lg' })} text-base">
					{half.cta}
					<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
			</span>
		</div>
	</div>
{/each}
</div>

<div class="border-t-2 border-foreground bg-background px-6 py-6 text-center text-sm text-muted-foreground">
		<p class="mx-auto max-w-2xl">
			We design boards and write firmware — both halves get used on our own projects. Questions, or
			something looks off?
			<a
				href="https://github.com/typecad"
				target="_blank"
				rel="noreferrer"
				class="font-bold text-primary underline hover:no-underline">
				Open an issue on GitHub
			</a>
			— we'd rather hear about it.
		</p>
</div>
