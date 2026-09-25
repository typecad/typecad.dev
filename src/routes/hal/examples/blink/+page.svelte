<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('blink');
	if (!example) error(404, 'Example not found');

	const create = `npx @typecad/hal create my-project --target xiao_ble/nrf52840
cd my-project`;
	const flash = `npx @typecad/hal build --compile --upload --port COM4`;
	const test = `npx @typecad/hal test

  Blink
    ✓ turns the LED on
    ✓ turns the LED off

  2 passing`;
</script>

<svelte:head>
	<title>{example.title} — typeCAD/hal examples</title>
	<meta name="description" content={example.description} />
</svelte:head>

<section class="theme-hal flex flex-1 flex-col bg-background text-foreground">
	<div class="mx-auto w-full max-w-4xl px-6 py-10">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href="/hal" class="hover:text-foreground hover:underline">hal</a> /
			<a href="/hal/examples" class="hover:text-foreground hover:underline">examples</a> /
			<span class="text-foreground">blink</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">{example.title}</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{example.description}</p>

		<p class="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
			Click through the files — it's the whole project
		</p>
		<div class="mt-2">
			<WorkspaceViewer {example} />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">The whole flow</h2>

		<h3 class="mt-6 font-bold">1 — Create the project</h3>
		<div class="mt-2">
			<CodeBlock code={create} label="terminal" />
		</div>

		<h3 class="mt-6 font-bold">2 — Write the program</h3>
		<p class="mt-2 text-sm leading-relaxed">
			Open <code>src/main.ts</code> and replace the starter with the blink program from the editor
			above. That's the entire program — construction carries the configuration, and the
			<code>while (true)</code> loop is the main loop.
		</p>

		<h3 class="mt-6 font-bold">3 — Compile and flash</h3>
		<div class="mt-2">
			<CodeBlock code={flash} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			When the flash finishes, the onboard LED blinks twice a second. Change <code>500</code> to
			<code>100</code> and rebuild — the whole edit-build-flash cycle is one command.
		</p>

		<h3 class="mt-6 font-bold">4 — Test it on the real board</h3>
		<p class="mt-2 text-sm leading-relaxed">
			<code>test/blink.test.ts</code> runs on the board itself: the tests are flashed, their
			assertions evaluate on real hardware, and pass/fail comes back over serial.
		</p>
		<div class="mt-2">
			<CodeBlock code={test} label="terminal" />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/hal/docs/gpio-digital-io" class="font-bold text-primary underline">GPIO &amp; Digital I/O</a>
				— everything set, get, and toggle can do, including interrupts
			</li>
			<li>
				<a href="/hal/docs/getting-started" class="font-bold text-primary underline">Getting started</a>
				— installing the toolchain, if you haven't yet
			</li>
		</ul>

		<div class="mt-12 border-t-2 border-foreground pt-6">
			<a
				href="/hal/examples"
				class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2 text-muted-foreground')}>
				<ArrowLeft class="size-4" /> All examples
			</a>
		</div>
	</div>
</section>
