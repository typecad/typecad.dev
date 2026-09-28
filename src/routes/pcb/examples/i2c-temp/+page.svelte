<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('i2c-temp');
	if (!example) error(404, 'Example not found');

	const generate = `cd my-project/hw
npx typecad-pcb add component      # KiCAD library → ATtiny85-20S
npx typecad-pcb add component      # KiCAD library → LM75`;
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
			<span class="text-foreground">i2c-temp</span>
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
				<code>ATtiny85_20S.ts</code> and <code>LM75.ts</code> are generated files —
				<code>typecad-pcb add component</code> wrote them from the KiCAD library. Each pin gets a
				name and a type, so <code>sensor.SDA</code> replaces <code>u2.pin(1)</code>.
			</li>
			<li>
				One 4.7 kΩ pull-up per bus line, both to VCC. They live on the nets, not on a special I2C
				object — SDA and SCL are just named nets.
			</li>
			<li>
				The LM75's address pins are grounded, which fixes its address at 0x48. Tie them
				differently and you get 0x49 through 0x4F — eight sensors, one bus.
			</li>
			<li>
				Generated files are ordinary TypeScript: check them into git, edit them, hand them to
				<code>typecad-pcb add component</code> again only when the part changes.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Generate the parts</h3>
		<div class="mt-2">
			<CodeBlock code={generate} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Pick <em>KiCAD library</em> and search for the part — the tool writes the file into
			<code>hw/src/</code> next to your entry file. The ATtiny85 file here also names the two USI
			pins that double as SDA and SCL.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/pcb/docs/components" class="font-bold text-primary underline">Components</a>
				— the add-component tool, generated files, and <code>typecad-pcb search</code>
			</li>
			<li>
				<a href="/pcb/docs/connections" class="font-bold text-primary underline">Connections</a>
				— named nets and everything else <code>net()</code> does
			</li>
			<li>
				<a href="/pcb/docs/placement" class="font-bold text-primary underline">Placement</a>
				— <code>fromLeft</code>, <code>fromRight</code>, and the edge-relative helpers
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
