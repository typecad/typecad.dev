<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('jlc-export');
	if (!example) error(404, 'Example not found');

	const add = `cd my-project/hw
npx typecad-pcb add component --c=C16581`;
	const build = `npx @typecad/pcb build`;
	const exportCmds = `npx typecad-pcb export gerbers      # → build/gerbers/
npx typecad-pcb export drill        # → build/gerbers/`;
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
			<span class="text-foreground">jlc-export</span>
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
				<code>TP4056.ts</code> came from JLC's ecosystem: the <code>C###</code> number pulls the
				footprint and 3D model from EasyEDA. No KiCAD symbol exists for this part, so the pin
				table in the file is the source of truth the schematic is built from.
			</li>
			<li>
				The EasyEDA conversion isn't always perfect — pin types sometimes come through as
				<em>unspecified</em>. Fix them in the generated file; it's yours.
			</li>
			<li>
				The circuit is the classic single-cell charger: 5 V in, a 2 kΩ program resistor for a
				500 mA charge current, and the CHRG LED that lights while the cell charges. TEMP and
				STDBY are there when you want them.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Add the part, build, export</h3>
		<div class="mt-2">
			<CodeBlock code={add + '\n' + build + '\n\n' + exportCmds} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			For JLC's assembly service, the BOM is already in <code>build/lipo_charger.csv</code> and
			every C-part in it is a part JLC stocks by number — zip <code>build/gerbers/</code>, upload
			both, done. Design rules default to the JLCPCB no-surcharge standard, so the DRC and the
			fab agree.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/components" class="font-bold text-primary underline">Components</a>
				— EasyEDA/JLCPCB parts and the add-component tool
			</li>
			<li>
				<a href="/pcb/docs/cli" class="font-bold text-primary underline">The CLI</a>
				— export gerbers, export drill, and the rest
			</li>
			<li>
				<a href="/pcb/docs/board-layout" class="font-bold text-primary underline">Board Layout</a>
				— design rules and the JLCPCB defaults
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
