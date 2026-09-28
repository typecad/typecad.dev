<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('boot-counter');
	if (!example) error(404, 'Example not found');

	const flash = `npx @typecad/hal build --compile --upload --port COM4`;
	const session = `boot #1 — re-flash the app, the number keeps counting
boot #2 — re-flash the app, the number keeps counting
boot #3 — re-flash the app, the number keeps counting`;
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
			<span class="text-foreground">boot-counter</span>
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
				The counter lives in a <code>Store</code> — typed key/value settings, one namespace.
				The read takes a <strong>required default</strong>, so first boot is explicit:
				<code>getInt('boots', 1)</code> returns exactly 1 when the key doesn't exist.
			</li>
			<li>
				The <code>File</code> holds a note a person could read — a boot log line. Note there is
				no append: <code>write()</code> rewrites the whole file, so a log that grows isn't what
				File is for. The latest line is.
			</li>
			<li>
				The guarantee both rest on: values live in the board's storage partition, not the
				application image, so re-flashing the app leaves them alone. Erasing the whole flash
				wipes them — that's the boundary.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Prove it</h3>
		<div class="mt-2">
			<CodeBlock code={flash} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Flash it, watch the counter, flash it again:
		</p>
		<div class="mt-2">
			<CodeBlock code={session} label="serial monitor" />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/hal/docs/storage" class="font-bold text-primary underline">Storage &amp; Persistent Data</a>
				— both classes, the defaults rule, and the storage guarantee
			</li>
			<li>
				<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards</a>
				— where the storage partition comes from
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
