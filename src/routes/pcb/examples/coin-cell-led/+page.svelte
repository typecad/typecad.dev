<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('coin-cell-led');
	if (!example) error(404, 'Example not found');

	const build = `cd my-project/hw
	npx @typecad/pcb build`;
	const output = `build/
	  coin_cell_led.kicad_pcb
	  coin_cell_led.kicad_sch
	  coin_cell_led.net
	  coin_cell_led.csv   ← the BOM`;
</script>

<svelte:head>
	<title>{example.title} — typeCAD/pcb examples</title>
	<meta name="description" content={example.description} />
</svelte:head>

<section class="theme-pcb flex flex-1 flex-col bg-background text-foreground">
	<div class="mx-auto w-full max-w-4xl px-6 py-10">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href="/pcb" class="hover:text-foreground hover:underline">pcb</a> /
			<a href="/pcb/examples" class="hover:text-foreground hover:underline">examples</a> /
			<span class="text-foreground">coin-cell-led</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">{example.title}</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{example.description}</p>

		<p class="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
			Click through the files — it's the whole project
		</p>
		<div class="mt-2">
			<WorkspaceViewer {example} />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">What's going on</h2>
		<ul class="ml-6 mt-3 list-disc space-y-2 text-sm leading-relaxed">
			<li>
				The <code>Power</code> object marks the holder as a source: pin 1 becomes
				<code>power_out</code>, pin 2 becomes <code>power_in</code>, and the voltage and current
				travel with it. ERC on the built schematic uses those types.
			</li>
			<li>
				The LED and resistor are built-in passives — <code>size</code> picks the package, and the
				value is a string that lands on the schematic and in the BOM.
			</li>
			<li>
				A CR2450 tops out around 3 V, so a 100 Ω resistor keeps the LED at a sensible current —
				swap the value and rebuild; the schematic, netlist, and BOM all follow.
			</li>
			<li>
				Placement is all relative: the holder is centered, the resistor sits below it, and the
				LED follows the resistor — move the holder and the rest comes along at
				<code>create()</code>.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Build</h3>
		<div class="mt-2">
			<CodeBlock code={build} label="terminal" />
		</div>
		<div class="mt-2">
			<CodeBlock code={output} label="output" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			The <code>runERC()</code> call at the end of the entry file prints its findings on every
			build — the check runs against <code>build/coin_cell_led.kicad_sch</code>, so it sees what
			you see.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/pins-power" class="font-bold text-primary underline">Pins &amp; Power</a>
				— the Power class, direction, and what ERC does with pin types
			</li>
			<li>
				<a href="/pcb/docs/passives" class="font-bold text-primary underline">Passives</a>
				— LEDs, resistors, and the other built-ins
			</li>
			<li>
				<a href="/pcb/docs/checks-export" class="font-bold text-primary underline">Checks &amp; Export</a>
				— runERC, runDRC, and the export functions
			</li>
		</ul>

		<div class="mt-12 border-t-2 border-foreground pt-6">
			<a
				href="/pcb/examples"
				class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 text-muted-foreground')}>
				<ArrowLeft class="size-4" /> All examples
			</a>
		</div>
	</div>
</section>
