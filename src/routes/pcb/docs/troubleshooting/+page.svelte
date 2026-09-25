<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';

	const subpath = `// ❌ wrong — there are no subpath imports
import { Connector } from '@typecad/pcb/passives';

// ✅ everything ships from the package root
import { Connector } from '@typecad/pcb';`;

	const connect = `// ❌ wrong
pin1.connect(pin2);

// ✅ connections live on the PCB
typecad.net(pin1, pin2);`;

	const pinAccess = `// ❌ wrong — generated components don't take pin names as strings
esp32.pin('VDD')

// ✅ named pins are properties; numbers always work
esp32.VDD        // or esp32.pin(8) if VDD is pin 8`;

	const connector = `// ❌ wrong
new Connector({ pins: 3 })

// ✅ the option is number
new Connector({ number: 3 })`;
</script>

<svelte:head>
	<title>Troubleshooting — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Common typeCAD errors and their fixes: imports, connections, pin access, component options, and build failures."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Troubleshooting</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Common errors and what actually fixes them.
</p>

<ApiCard
	name="import and module errors"
	kind="fixes"
	purpose="Module resolution problems — almost always directory or import-path issues."
	imports={"Cannot find module '@typecad/pcb'"}>
	{#snippet example()}
		<h3 class="text-sm font-bold">&ldquo;Cannot find module '@typecad/pcb'&rdquo;</h3>
		<ul class="ml-6 mt-2 list-disc space-y-1 text-sm leading-relaxed">
			<li>Work happens in the <code>hw/</code> directory — check you're there</li>
			<li><code>hw/package.json</code> must list <code>@typecad/pcb</code> as a dependency</li>
			<li>Run <code>npm install</code> in <code>hw/</code></li>
		</ul>
		<h3 class="mt-4 text-sm font-bold">&ldquo;Module has no exported member …&rdquo;</h3>
		<p class="mt-2 text-sm leading-relaxed">Importing from a subpath instead of the package root:</p>
		<CodeBlock code={subpath} label="imports.ts" class="mt-2" />
	{/snippet}
</ApiCard>

<ApiCard
	name="connection errors"
	kind="fixes"
	purpose="The two connection shapes people reach for first — neither exists."
	imports={"Property 'connect' does not exist"}>
	{#snippet example()}
		<CodeBlock code={connect} label="connect.ts" />
		<CodeBlock code={pinAccess} label="pins.ts" class="mt-3" />
	{/snippet}
</ApiCard>

<ApiCard
	name="component errors"
	kind="fixes"
	purpose="Generated components and their options."
	imports={"Cannot find name 'ComponentName'"}>
	{#snippet example()}
		<h3 class="text-sm font-bold">&ldquo;Cannot find name 'ComponentName'&rdquo;</h3>
		<ul class="ml-6 mt-2 list-disc space-y-1 text-sm leading-relaxed">
			<li>Create the component with <code>typecad-pcb add component</code></li>
			<li>Check the import statement matches the generated file name</li>
			<li>Generated files live in <code>hw/src/</code></li>
		</ul>
		<h3 class="mt-4 text-sm font-bold">Option names</h3>
		<CodeBlock code={connector} label="connector.ts" class="mt-2" />
		<p class="mt-2 text-sm leading-relaxed">
			Check the generated file's header comment — every component documents its options there.
		</p>
	{/snippet}
</ApiCard>

<ApiCard
	name="build errors"
	kind="checklist"
	purpose="Two checklists: one for TypeScript failures, one for the generated KiCAD output."
	imports="tsc / kicad">
	{#snippet example()}
		<h3 class="text-sm font-bold">TypeScript compilation</h3>
		<ul class="ml-6 mt-2 list-disc space-y-1 text-sm leading-relaxed">
			<li>Check all imports are correct</li>
			<li>Every component reaches the output through <code>typecad.create(...)</code></li>
			<li>Pin connections use <code>typecad.net(...)</code></li>
		</ul>
		<h3 class="mt-4 text-sm font-bold">KiCAD generation</h3>
		<ul class="ml-6 mt-2 list-disc space-y-1 text-sm leading-relaxed">
			<li>All components have valid symbol and footprint paths</li>
			<li>Nets have at least two pins — <code>typecad-pcb query unconnected</code> finds the lonely ones</li>
			<li>Reference designators are unique</li>
		</ul>
	{/snippet}
</ApiCard>

<Callout label="Still stuck">
	Check the <a href="/pcb/examples" class="font-bold text-primary underline">examples</a> for
	working patterns, or bring the error to
	<a href="https://www.reddit.com/r/typecad/" class="font-bold text-primary underline">r/typecad</a>.
</Callout>
