<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('wifi-http');
	if (!example) error(404, 'Example not found');

	const create = `npx @typecad/hal create my-project --target esp32s3_devkitc
cd my-project`;
	const flash = `npx @typecad/hal build --compile --upload --port COM4`;
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
			<span class="text-foreground">wifi-http</span>
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
				The <code>WiFi</code> constructor carries the whole link policy — credentials, a 15 s
				associate timeout, power saving. <code>join()</code> blocks until there's an IP;
				<code>onUp</code>/<code>onDrop</code> fire on the link's own schedule after that.
			</li>
			<li>
				Each poll is one <code>Request</code> object: method, URL, headers, send, then
				<code>ok()</code>/<code>text()</code>. The body is valid until the next
				<code>send()</code> — copy it out if you need to keep it.
			</li>
			<li>
				<code>https://</code> is native — pass a <code>caCert</code> to verify, or
				<code>insecure: true</code> for a lab server you don't trust to have a real
				certificate.
			</li>
			<li>
				WiFi needs an ESP32 target — <code>esp32s3_devkitc</code> here. One hardware note worth
				knowing: some ESP32-S3 dev kits reboot the moment the radio transmits. If the board
				restarts on <code>join()</code>, it's usually power, not code.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Flash and watch</h3>
		<div class="mt-2">
			<CodeBlock code={create + '\n' + flash} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Put your own SSID and PSK in <code>src/main.ts</code> before flashing. Then open a serial
			monitor at 115200 — you'll see the IP on join, and a health line every five seconds. Point
			the URL at anything on your LAN that answers GET.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/hal/docs/networking" class="font-bold text-primary underline">Networking</a>
				— static IPs, scanning, async joins, and the full Request options
			</li>
			<li>
				<a href="/hal/docs/iot-networking" class="font-bold text-primary underline">MQTT</a>
				— the next step up from polling
			</li>
			<li>
				<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards</a>
				— target names and what compiles where
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
