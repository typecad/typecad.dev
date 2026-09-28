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
			cta: 'Build a board',
			ctaHref: '/pcb/docs/getting-started'
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
			ctaHref: '/hal/docs/getting-started'
		}
	];
</script>

<div class="relative flex flex-1 flex-col md:flex-row">
	<!-- nav sits above both halves: a row at the top on mobile, pinned to the
	     top-right (over the hal half) on desktop so it never lands mid-page -->
	<nav
		class="relative z-20 flex justify-center gap-1 px-6 pt-4 text-sm font-medium md:absolute md:right-6 md:top-4 md:justify-end md:px-0 md:pt-0">
		<a
			href="/pcb"
			class="border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground">
			pcb
		</a>
		<a
			href="/hal"
			class="border-2 border-transparent px-3 py-1.5 transition-colors hover:border-foreground">
			hal
		</a>
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

	{#each HALVES as half (half.href)}
		<div
			class="{half.theme} group relative flex flex-1 flex-col border-foreground bg-background px-6 pb-16 pt-4 text-foreground text-center transition-[flex-grow] duration-200 md:min-h-[calc(100vh-5rem)] md:border-r-2 md:last:border-r-0 md:hover:grow-[1.1]">
			<!-- stretched link: the whole half is clickable -->
			<a href={half.href} aria-label={half.name} class="absolute inset-0 z-10"></a>

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

				<a
					href={half.ctaHref}
					class="{buttonVariants({ variant: 'default', size: 'lg' })} relative z-20 text-base">
					{half.cta}
					<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
				</a>
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
