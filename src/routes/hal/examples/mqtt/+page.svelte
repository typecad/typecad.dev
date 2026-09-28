<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('mqtt');
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
			<span class="text-foreground">mqtt</span>
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
				<code>connect()</code> returns immediately — the session completes on a background poll
				thread that owns the keepalives and acks, which is why the loop checks
				<code>linked()</code> before publishing instead of waiting on connect.
			</li>
			<li>
				The wildcard <code>cmd/#</code> subscription catches every sub-topic under
				<code>cmd/</code>; the <code>onMessage</code> handler gets <code>(topic,
				payload)</code> and decides what each one means.
			</li>
			<li>
				Publishes are QoS 1 — the client retries until the broker acks. Payloads are strings;
				<code>String(value)</code> is all the formatting this example needs.
			</li>
			<li>
				Like all networking, this needs an ESP32 target. MQTT over TLS is the same constructor
				with an <code>mqtts://</code> URI.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Flash and try it</h3>
		<div class="mt-2">
			<CodeBlock code={create + '\n' + flash} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Point it at a broker you can reach — Mosquitto on a LAN machine works, and
			<code>mosquitto_sub -t 'sensors/#'</code> shows the readings arriving. Publish to
			<code>cmd/report</code> and the board answers on the serial monitor.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/hal/docs/iot-networking" class="font-bold text-primary underline">IoT Networking</a>
				— the full Mqtt API and TLS
			</li>
			<li>
				<a href="/hal/docs/networking" class="font-bold text-primary underline">Networking</a>
				— the WiFi layer underneath
			</li>
			<li>
				<a href="/hal/docs/sensors" class="font-bold text-primary underline">Sensors</a>
				— the SHT3X feeding the readings
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
