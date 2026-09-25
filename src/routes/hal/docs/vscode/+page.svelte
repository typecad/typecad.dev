<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const install = `npx @typecad/hal create my-project --target esp32s3_devkitc
code my-project   # the extension is already in .vscode/extensions/`;

	const diagnostics = [
		['Same analysis as the build', 'Saves run the project\'s own @typecad/cuttlefish engine in no-emit mode — editor diagnostics can never drift from build diagnostics'],
		['Whole import graph', 'Pin capabilities, alias conflicts, peripheral ownership, try/catch on no-exception targets — mapped to real ranges with severity icons matching the CLI'],
		['Re-analyzes on change', 'Every save, and any change to the config, typecad-hal.facts.json, or the board module']
	];

	const quickFixes = [
		['Pin swap', 'A pin-capability error offers a swap to the first capable pin — applied only at pin-argument construction sites, never a blanket rename'],
		['Borrow by reference', 'Ownership fix that promotes the storage keyword and annotates the destination : Shared'],
		["Make 'x' const", 'The other ownership fix, for parts that don\'t need to move'],
		['Drift-safe edits', 'Fixes verify the document hasn\'t changed since the diagnostic — if it has, they skip cleanly instead of mangling the file']
	];

	const hovers = [
		['Your bindings', "new ADC(PA0) reads 'ADC — on PA0' with the harvested silicon routes; pin aliases and bus devices (I2C0.device(0x48)) resolve the same way"],
		['Gated classes', 'Store and File show their storage regions, Counter the free hardware counters, Watchdog its wiring'],
		['Sensor catalog', "SENSOR('bme688') resolves against the 200+ part catalog"],
		['Claimed pins', "Shows current usage — 'In this project: ANALOG (ADC 0)'"],
		['Board module', 'Generated board.ts exports carry pin facts as JSDoc, so even plain tsserver hovers are board-aware']
	];

	const devices = [
		['▶ Flash & Monitor', 'A CodeLens on the entry file — compile, flash, and attach the monitor in the shared "TypeCAD" terminal'],
		['⚡ Run on Hardware', 'The same one-click for test files'],
		['Serial port picker', 'Ports are listed from attached USB devices with manufacturer and VID:PID; the cached choice is re-validated on every use'],
		['Re-enumeration wait', '--monitor waits out the board\'s post-flash serial re-enumeration (up to 8 s) instead of racing it']
	];

	const uiLanguage = [
		['Syntax highlighting', 'Single-file .ui components: TypeScript in <script>, CSS in <style>, Svelte-style markup (on:click={handler}, {expressions})'],
		['Snippets', 'screen, button, bind, signal, canvas, list — and more'],
		['Markdown injection', 'Fenced ```ui code blocks highlight inside markdown docs'],
		['Declarations', 'Saving a .cpp file auto-generates a .d.ts sidecar if missing (never clobbers one); a palette command generates for the active file and opens it']
	];

	const commands = [
		['typecad-intel.reanalyze', 'TypeCAD: Re-analyze Project'],
		['typecad-intel.flashMonitor', 'TypeCAD: Flash & Monitor'],
		['typecad-intel.runTests', 'TypeCAD: Run Tests on Hardware'],
		['typecad-intel.selectPort', 'TypeCAD: Select Serial Port'],
		['typecad-debug.generateDeclaration', 'TypeCAD: Generate Declaration from C++']
	];

	const debugFlow = `F5          // build task compiles + flashes with --debug, GDB server on :3333
USB0.writeLine('alive');   // serial print works on every board`;
</script>

<svelte:head>
	<title>The VS Code extension — typeCAD/hal docs</title>
	<meta
		name="description"
		content="The typeCAD/hal VS Code extension: board-aware diagnostics identical to the build, hovers and quick-fixes, inline fact chips, Flash & Monitor, .ui syntax support, and native GDB debugging."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">The VS Code extension</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Every typeCAD/hal project ships with its own editor intelligence. The extension is vendored into
	the project by <code>create</code> — no marketplace install — and it merges what used to be three
	separate extensions (typecad-ui, the debugger, and the intel extension) into one.
</p>

<ApiCard
	name="Installation"
	kind="workflow"
	purpose="`typecad-hal create` vendors the built extension into the project's
		`.vscode/extensions/` folder (with a `forceInstall` entry in `.vscode/extensions.json`), so
		opening the project in VS Code is all it takes. Projects pin the experience — no global
		installs, no version drift between machines."
	imports={".vscode/extensions/"}>
	{#snippet example()}
		<CodeBlock code={install} label="terminal" />
	{/snippet}
</ApiCard>

<ApiCard
	name="Board-aware diagnostics"
	kind="feature"
	purpose="The Problems panel is the build's own analysis, not an approximation of it — the
		extension runs the same engine the CLI does, through the project's installed copy."
	imports={"Problems panel"}>
	{#snippet example()}
		<DocsTable headers={['What', 'How it works']} rows={diagnostics} />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Quick-fixes</h3>
	<p class="mt-2 text-sm leading-relaxed">
		Diagnostics come with fixes where a fix makes sense:
	</p>
	<div class="mt-3">
		<DocsTable headers={['Fix', 'What it does']} rows={quickFixes} monoCols={[0]} />
	</div>
</ApiCard>

<ApiCard
	name="Hovers & fact chips"
	kind="feature"
	purpose="Hover anything hardware-related and the extension answers with facts harvested from the
		board's silicon — routes, ownership, catalog parts."
	imports={"hover · ⌁ inline chips"}>
	{#snippet example()}
		<DocsTable headers={['On hover', 'What you see']} rows={hovers} />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Construction lines also get inline fact chips — <code>new ADC(PA0)</code> shows
		<code>⌁ PA0 · PWM pwm2 ch1 · ADC adc1 ch0 · aliases: BUTTON</code> right after the line. The
		chips track unsaved edits and skip strings, templates, and comments.
	</p>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Status bar</h3>
	<p class="mt-2 text-sm leading-relaxed">
		The status bar shows the board name with live error/warning counts
		(<code>blackpill_f401cc · 0E 1W</code>); hover it for memory estimates, async task and ISR
		counts, and timer usage. Click to re-analyze. A missing engine or config shows an actionable
		hint instead of silence.
	</p>
</ApiCard>

<ApiCard
	name="Flash & Monitor"
	kind="feature"
	purpose="The daily loop is one click: a `▶ Flash & Monitor` CodeLens sits on the entry file, and
		tests get `⚡ Run on Hardware`. Both reuse a shared terminal named TypeCAD."
	imports={"CodeLens · TypeCAD terminal"}>
	{#snippet example()}
		<DocsTable headers={['Feature', 'Behavior']} rows={devices} />
	{/snippet}
	<Callout>
		<code>TypeCAD: Select Serial Port</code> forces a re-pick at any time — the picker lists
		attached USB devices with their manufacturer and VID:PID.
	</Callout>
</ApiCard>

<ApiCard
	name=".ui language & declarations"
	kind="feature"
	purpose="The merged extension carries the former typecad-ui language support, plus C++
		declaration generation for hand-written native code."
	imports={".ui files · .d.ts sidecars"}>
	{#snippet example()}
		<DocsTable headers={['Feature', 'What it gives you']} rows={uiLanguage} />
	{/snippet}
	<Callout>
		See the <a href="/hal/docs/ui" class="font-bold text-primary underline">UI page</a> for the
		<code>.ui</code> format itself.
	</Callout>
</ApiCard>

<ApiCard
	name="Source-level debugging"
	kind="workflow"
	purpose="F5 debugs your TypeScript sources natively over GDB on boards with a debug-capable probe
		method (openocd, jlink — it's in the board facts). `launch.json` and `tasks.json` are written
		at create/build time: the build task compiles and flashes with `--debug`, and the debug
		server serves GDB on port 3333."
	imports={"F5 · GDB :3333"}>
	{#snippet example()}
		<CodeBlock code={debugFlow} label="debug loop" />
	{/snippet}
	<Callout label="Printf debugging is gone">
		The old breakpoint-instrumentation pipeline was removed — `--debug` now means native GDB
		debugging, nothing else. Boards without a debug probe fail with an explicit
		<code>debug-unsupported-target</code> diagnostic instead of silently producing an
		un-debuggable binary. For print debugging, serial print via
		<code>USB0.writeLine(...)</code> / <code>UART0.writeLine(...)</code> works everywhere.
	</Callout>
</ApiCard>

<ApiCard
	name="Commands"
	kind="reference"
	purpose="Command IDs keep their historical typecad-intel / typecad-debug prefixes from the
		pre-merge extensions; the titles all start with TypeCAD:."
	imports={"command palette"}>
	{#snippet example()}
		<DocsTable headers={['Command ID', 'Title']} rows={commands} monoCols={[0]} />
	{/snippet}
</ApiCard>
