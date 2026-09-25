<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const commands = [
		['typecad-hal create [name]', 'Scaffold a project for a board target'],
		['typecad-hal build', 'Transpile, and with flags compile, upload, monitor'],
		['typecad-hal test [files...]', 'Flash and run hardware tests'],
		['typecad-hal board sync | regen', 'Rebuild the board catalog / regenerate the board module'],
		['typecad-hal preview', 'Browser preview of a UI screen'],
		['typecad-hal doctor', 'Verify the toolchain (west, SDK, board target)'],
		['typecad-hal licenses', 'SPDX audit of the Zephyr tree and its projects'],
		['typecad-hal library search | install | init | validate', 'The library-package catalog'],
		['typecad-hal query', 'Ask the board module questions'],
		['typecad-hal gen-decls', 'Generate .d.ts from C++ headers'],
		['typecad-hal clean', 'Remove generated output'],
		['typecad-hal debug-server start | stop', 'Drive the west GDB server for debugging']
	];

	const createFlags = [
		['--target, -t / --board, -b', 'The board target, e.g. xiao_ble/nrf52840'],
		['--framework, -f', 'Framework package (default: @typecad/framework-zephyr)'],
		['--probe, --flash <id>', 'Named probe method — stlink, jlink, dfu, uf2...'],
		['--port, -p / --baud', 'Serial defaults for the project'],
		['--no-starter / --no-install', 'Skip the blink starter / skip npm install'],
		['--outDir, -o', 'Where the project goes']
	];

	const buildFlags = [
		['--compile', 'Run west build'],
		['--upload', 'Flash — requires --compile'],
		['--monitor', 'Attach a serial monitor after upload — waits out post-flash re-enumeration instead of racing it'],
		['--watch, -w', 'Rebuild on changes (not combinable with --monitor)'],
		['--expect [file]', 'Run hardware tests after the build'],
		['--port / --baud', 'Serial port for upload/monitor/tests'],
		['--diagnostics', 'Write the build report (Markdown/JSON)'],
		['--debug', 'Native GDB source-level debugging (F5 in VS Code) — boards without a debug probe fail with debug-unsupported-target'],
		['--force', 'Bypass the cached lint gate'],
		['--skip-type-check / --no-transpile', 'Partial runs for special cases']
	];

	const treeShake = [
		['--no-tree-shake', 'Keep everything'],
		['--keep-unused-enums / -classes / -types / -variables', 'Keep one category'],
		['--entry-point <name>', 'Additional entry point — repeatable']
	];

	const otherFlags = [
		['--autosar[=off|warn|strict]', 'AUTOSAR C++14 checks on the generated code (bare flag = strict)'],
		['--autosar-arxml', 'Emit the deviation file for ARXML consumers'],
		['--strict-css', 'UI CSS warnings become errors'],
		['--emit cpp | split', 'Single file or per-source split (default split)'],
		['--emit-maps / --build-target / --framework', 'Source maps, target override, framework override']
	];

	const dailyLoop = `typecad-hal create my-project --target xiao_ble/nrf52840
typecad-hal build --compile --upload --monitor --port COM4`;
</script>

<svelte:head>
	<title>The CLI — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Every typecad-hal command and its flags: create, build, test, board, preview, doctor, licenses, library, query, and gen-decls."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">The CLI</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Everything ships as <code>typecad-hal</code> — run it through <code>npx @typecad/hal</code> or
	install it. The whole toolchain is one binary: the daily loop is
	<code>create</code>, <code>build</code>, <code>test</code>.
</p>

<ApiCard
	name="commands"
	kind="reference"
	purpose="The full command list. Global options: --help, and the port can always come from the
		TYPECAD_HAL_PORT environment variable."
	imports={"typecad-hal <command>"}>
	{#snippet example()}
		<DocsTable headers={['Command', 'What it does']} rows={commands} monoCols={[0]} />
	{/snippet}
		<CodeBlock code={dailyLoop} label="terminal" class="mt-3" />
</ApiCard>

<ApiCard
	name="build"
	kind="reference"
	purpose="The transpile-and-flash pipeline. Flags chain: --compile builds, --upload flashes,
		--monitor watches the serial port. Most flags have sensible defaults; the config file covers
		the rest."
	imports={"typecad-hal build [flags]"}>
	{#snippet example()}
		<DocsTable headers={['Flag', 'Meaning']} rows={buildFlags} monoCols={[0]} />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Tree-shaking</h3>
	<p class="text-sm leading-relaxed">
		Unused code never reaches the board — reachability from the entry point decides. Flags
		override:
	</p>
	<div class="mt-3">
		<DocsTable headers={['Flag', 'Meaning']} rows={treeShake} monoCols={[0]} />
	</div>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Everything else</h3>
	<div class="mt-3">
		<DocsTable headers={['Flag', 'Meaning']} rows={otherFlags} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="create"
	kind="reference"
	purpose="Scaffolds a project: config file, tsconfig wired to the board module, a blink starter,
		and tests — installed and ready to build."
	imports={"typecad-hal create [name]"}>
	{#snippet example()}
		<DocsTable headers={['Flag', 'Meaning']} rows={createFlags} monoCols={[0]} />
	{/snippet}
	<Callout>
		Board targets come from your installed Zephyr tree — run
		<code>typecad-hal board sync</code> after <code>west update</code>. See
		<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards &amp; Targets</a>.
	</Callout>
</ApiCard>
