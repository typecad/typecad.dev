<script lang="ts">
	import { type ExampleStub } from '$lib/examples';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	// written next — cards appear here now, pages follow
	const stubs: ExampleStub[] = [
		{
			title: 'Coin-cell LED board',
			blurb: 'A battery holder, a resistor, and an LED — the Power class, ERC, and a board that lights up.'
		},
		{
			title: 'I2C sensor breakout',
			blurb: 'A generated component file, I2C pull-ups, and named SDA/SCL nets between an MCU and a sensor.'
		},
		{
			title: 'Auto-route the whole netlist',
			blurb: 'Place a small board with the placement helpers and let the router connect every net.'
		},
		{
			title: 'JLCPCB parts and export',
			blurb: 'Add EasyEDA C### parts and generate fab-ready outputs for JLC assembly.'
		}
	];

	const examples = [
		{
			href: '/pcb/examples/first-board',
			title: 'Your first board',
			blurb: 'Two resistors, three named nets, one build — the whole flow, in a simulated editor.'
		},
		{
			href: '/pcb/examples/multilayer-board',
			title: 'A four-layer board',
			blurb: 'Stackup, inner-layer planes, impedance-routed signals, stitching, and teardrops.'
		},
		{
			href: '/pcb/examples/packages',
			title: 'Use a package — solar charger',
			blurb: 'npm install a complete charger circuit and wire it up like any other component.'
		},
		{
			href: '/pcb/examples/jig',
			title: 'Test jig — two boards, one codebase',
			blurb: 'The board under test and its pogo-pin fixture from the same project.'
		},
		{
			href: '/pcb/examples/import-kicad',
			title: 'Imported from KiCAD',
			blurb: 'Turn an existing .kicad_pcb into source you can build on.'
		}
	];
</script>

<svelte:head>
	<title>Examples — typeCAD/pcb</title>
	<meta
		name="description"
		content="Complete typeCAD/pcb projects you can copy: create the project, write the board in TypeScript, build, and open it in KiCAD."
	/>
</svelte:head>

<section class="theme-pcb flex flex-1 flex-col bg-background text-foreground">
	<div class="mx-auto w-full max-w-5xl px-6 py-10">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href="/pcb" class="hover:text-foreground hover:underline">pcb</a> /
			<span class="text-foreground">examples</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">🧩 Examples</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
			Complete projects you can copy: create the project, write the board in TypeScript, build,
			open it in KiCAD. More land here as they're written.
		</p>

		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
			{#each examples as example (example.href)}
				<a
					href={example.href}
					class="group border-2 border-foreground bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
					<span
						class="inline-block bg-primary px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
						example
					</span>
					<span class="mt-3 flex items-center gap-1.5 text-lg font-bold">
						{example.title}
						<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
					</span>
					<span class="mt-2 block text-sm leading-relaxed text-muted-foreground">
						{example.blurb}
					</span>
				</a>
			{/each}

			{#each stubs as stub (stub.title)}
				<div class="border-2 border-foreground/40 bg-card p-5 text-muted-foreground">
					<span
						class="inline-block border border-current px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest">
						in progress
					</span>
					<span class="mt-3 block text-lg font-bold text-foreground">{stub.title}</span>
					<span class="mt-2 block text-sm leading-relaxed">{stub.blurb}</span>
				</div>
			{/each}
		</div>

		<div class="mt-12">
			<a href="/pcb/docs" class={buttonVariants({ variant: 'outline' })}>
				Back to the pcb reference
			</a>
		</div>
	</div>
</section>
