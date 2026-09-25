<script lang="ts">
	import { ArrowRight, Braces, Cpu, FlaskConical, ShieldCheck } from '@lucide/svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const benefits = [
		{
			icon: Cpu,
			title: 'Pins and ports as code',
			description:
				'Each pin, bus, and part is a TypeScript object. The HAL checks you are using them the right way — mistakes show up in your editor, not on the board.'
		},
		{
			icon: Braces,
			title: 'TypeScript becomes C++',
			description:
				'You write TypeScript and get clean, fast C++ firmware — nothing extra slowing it down.'
		},
		{
			icon: FlaskConical,
			title: 'Test on the real board',
			description:
				'Write tests in TypeScript. The test runner sends them to the board, runs them there, and reports pass or fail back to your terminal — one command.'
		},
		{
			icon: ShieldCheck,
			title: 'Catches mistakes early',
			description:
				'Spots problems the C++ compiler cannot: a delay that freezes your screen, two parts fighting over one pin, a program bigger than the board.'
		}
	];
</script>

<svelte:head>
	<title>typeCAD/hal — firmware in TypeScript</title>
	<meta
		name="description"
		content="typeCAD/hal turns TypeScript into firmware: typed pins and ports, tests that run on the real board, and mistakes caught before upload."
	/>
</svelte:head>

<section class="theme-hal flex flex-1 flex-col bg-background text-foreground">
	<div class="container flex flex-col items-center gap-4 py-20 text-center">
		<span
			class="border-2 border-foreground bg-background px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
			firmware
		</span>
		<h1 class="text-5xl font-bold tracking-tight">typeCAD<span class="text-primary">/hal</span></h1>
		<p class="text-lg text-muted-foreground">
			typescript 🟦 ↝ 🪁 zephyr
		</p>
		<div class="mt-2 flex flex-wrap items-center justify-center gap-3">
			<a href="/hal/docs" class={buttonVariants({ size: 'lg' })}>
				Get started <ArrowRight class="size-4" />
			</a>
			<a
				href="https://github.com/typecad/hal"
				target="_blank"
				rel="noreferrer"
				class={buttonVariants({ variant: 'outline', size: 'lg' })}>
				github/typecad/hal
			</a>
		</div>
	</div>

	<div class="container grid grid-cols-1 gap-6 pb-20 sm:grid-cols-2">
		{#each benefits as benefit (benefit.title)}
			<Card.Root class="border-2 border-foreground shadow-md">
				<Card.Header>
					<benefit.icon class="size-8 text-primary" />
					<Card.Title class="text-xl">{benefit.title}</Card.Title>
				</Card.Header>
				<Card.Content class="text-sm text-muted-foreground">
					{benefit.description}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="container flex flex-col items-center gap-3 pb-20 text-center">
		<h2 class="text-2xl font-bold">Firmware with a type system</h2>
		<p class="max-w-xl text-sm text-muted-foreground">
			Boards, pins, and peripherals become typed objects that catch mistakes before the code ever
			leaves your machine.
		</p>
		<a
			href="/hal/docs"
			class="text-sm font-bold text-primary underline hover:no-underline">
			Browse the HAL reference →
		</a>
		<a
			href="/hal/examples"
			class="text-sm text-primary underline hover:no-underline">
			Browse examples →
		</a>
		<p class="max-w-xl text-sm text-muted-foreground">
			We use it on our own boards. If a doc needs work or something doesn't behave,
			<a
				href="https://github.com/typecad/hal"
				target="_blank"
				rel="noreferrer"
				class="font-bold text-primary underline hover:no-underline">
				open an issue
			</a>
			— we'd rather hear about it.
		</p>
	</div>
</section>
