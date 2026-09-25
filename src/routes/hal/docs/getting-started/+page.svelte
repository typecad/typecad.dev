<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	const installer = `npx @typecad/framework-zephyr zephyr-installer`;
	const installerScripted = `npx @typecad/framework-zephyr zephyr-installer --platforms arm,esp32`;
	const create = `npx @typecad/hal create my-project --target esp32s3_devkitc
cd my-project`;
	const firmware = `import { GPIO, Time } from '@typecad/hal';
import { LED } from '@typecad/hal';

// Construction carries the configuration — there is no setup() to write.
const led = new GPIO(LED, GPIO.OUTPUT);

while (true) {
  led.toggle();
  Time.sleep(1000);
}`;
	const buildUpload = `npx @typecad/hal build --compile --upload --port COM4`;

	const maintain = `npx @typecad/framework-zephyr zephyr-installer --modify --platforms arm,esp32   # add toolchains
npx @typecad/framework-zephyr zephyr-installer --modify --prune   # ...and also remove unselected ones
npx @typecad/framework-zephyr zephyr-installer --delete           # uninstall everything`;

	const quickReference = [
		['Create project', 'npx @typecad/hal create my-project --target esp32s3_devkitc'],
		['Install Zephyr toolchain', 'npx @typecad/framework-zephyr zephyr-installer --platforms arm,esp32'],
		['Compile', 'npx @typecad/hal build --compile'],
		['Upload', 'npx @typecad/hal build --upload --port COM4'],
		['Watch mode', 'npx @typecad/hal build --watch --compile'],
		['Diagnostics', 'npx @typecad/hal build --diagnostics'],
		['Check environment', 'typecad-hal doctor']
	];

	const requirements = [
		['Node.js', 'LTS version recommended — node --version to verify', 'nodejs.org'],
		['Zephyr toolchain', 'Installed by the framework-zephyr installer (below) — no Python, conda, or SDK needed first', '—'],
		['Visual Studio Code', 'Not required, but recommended — the typeCAD/hal extension comes vendored into every project', 'code.visualstudio.com'],
		['git', 'Optional', 'git-scm.com']
	];
</script>

<svelte:head>
	<title>Getting started — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Install the Zephyr toolchain, create a typeCAD/hal project, and flash your first TypeScript firmware."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">🧰 Getting started</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Write firmware in TypeScript. typeCAD/hal turns it into the C++ that runs on Zephyr boards —
	ESP32, nRF52, RP2040, STM32, and more. Common hardware mistakes are caught in your editor as you
	type, not after you upload, and the result runs as fast as hand-written code.
</p>

<ApiCard
	name="🧰 Requirements"
	kind="checklist"
	purpose="Node.js and the Zephyr toolchain are the two real requirements. The toolchain installer is
		a single command — no preinstalled Python, conda, or SDK, and it works the same on Linux, macOS,
		and Windows (no WSL)."
	imports="Node.js LTS · Zephyr toolchain">
	{#snippet example()}
		<DocsTable headers={['Software', 'Notes', 'Link']} rows={requirements} linkCols={[2]} />
	{/snippet}
	<Callout>
		Having trouble? <code>typecad-hal doctor</code> checks the toolchain, boards, and environment
		and names exactly what's missing.
	</Callout>
</ApiCard>

<ApiCard
	name="📦 Install the Zephyr toolchain"
	kind="command"
	purpose="Embedded targets build on Zephyr, which needs a toolchain. The installer bundled with
		`@typecad/framework-zephyr` sets one up in a single command, with an interactive checklist of
		platforms — pick only the ones you need (~150–300 MB each) instead of the full 1.5 GB bundle."
	imports={"npx @typecad/framework-zephyr zephyr-installer"}>
	{#snippet example()}
		<CodeBlock code={installer} label="interactive" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Prefer scripting it? Select platforms up front — <code>arm</code> covers nRF/STM32/RP2040,
		<code>esp32</code> covers ESP32/S2/S3:
	</p>
	<CodeBlock code={installerScripted} label="scripted" class="mt-3" />
	<Callout>
		typeCAD/hal finds the installed environment automatically — no shell activation or PATH setup
		required.
	</Callout>
</ApiCard>

<ApiCard
	name="🔨 Create your first project"
	kind="command"
	purpose="One command scaffolds the project. `create` checks the installed toolchain, shows you every
		board your Zephyr tree supports, and installs the project's dependencies for you."
	imports={"npx @typecad/hal create"}>
	{#snippet example()}
		<CodeBlock code={create} label="terminal" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Then edit <code>src/main.ts</code> — this blinks the board LED, and it's the whole program.
		Construction carries the configuration; there is no <code>setup()</code> to write:
	</p>
		<CodeBlock code={firmware} label="src/main.ts" class="mt-3" />
		<Callout>
			Opened in VS Code, the project carries the typeCAD/hal extension with it — board-aware
			diagnostics, hovers, fact chips, and a <code>▶ Flash &amp; Monitor</code> CodeLens, with
			nothing to install from the marketplace. See
			<a href="/hal/docs/vscode" class="font-bold text-primary underline">The VS Code extension</a>.
		</Callout>
</ApiCard>

<ApiCard
	name="➡️ Compile and upload"
	kind="command"
	purpose="One build command compiles the TypeScript to C++, builds the Zephyr image, and flashes it
		over the serial port."
	imports={"npx @typecad/hal build"}>
	{#snippet example()}
		<CodeBlock code={buildUpload} label="terminal" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Quick reference</h3>
	<div class="mt-3">
		<DocsTable headers={['Task', 'Command']} rows={quickReference} monoCols={[1]} />
	</div>
	<Callout label="Maintaining the toolchain">
		<CodeBlock code={maintain} label="terminal" />
		<p class="mt-2">
			<code>--modify</code> re-runs the platform step on an existing install and is purely additive
			unless <code>--prune</code> is also given. <code>--delete</code> uninstalls everything
			(conda env, Zephyr SDK, west workspace) and asks you to type <code>yes</code> to confirm —
			add <code>--yes</code> to skip that in scripts.
		</p>
	</Callout>
</ApiCard>

<div class="mt-10 flex items-center justify-between border-t-2 border-foreground pt-6 text-sm">
	<a href="/hal/docs/gpio-digital-io" class={buttonVariants({ variant: 'outline' })}>
		Next: GPIO &amp; Digital I/O <ArrowRight class="size-4" />
	</a>
</div>

<p class="mt-6 text-sm text-muted-foreground">
	Something here unclear or out of date?
	<a
		href="https://github.com/typecad/hal"
		target="_blank"
		rel="noreferrer"
		class="font-bold text-primary underline hover:no-underline">
		Open an issue
	</a>
	— we'd rather hear about it.
</p>
