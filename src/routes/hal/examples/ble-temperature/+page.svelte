<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('ble-temperature');
	if (!example) error(404, 'Example not found');

	const create = `npx @typecad/hal create my-project --target xiao_ble/nrf52840
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
			<span class="text-foreground">ble-temperature</span>
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
				One sensor, one characteristic. The SHT3X sits on I2C at 0x44, and the GATT Temperature
				characteristic (2A6E) is an <code>Int16</code> in hundredths of a degree — the spec's
				units, not a float.
			</li>
			<li>
				<code>onRead(centi)</code> answers a phone's read request with the last fetched value;
				<code>notify(0, centi())</code> pushes a fresh one to subscribers every two seconds.
				The <code>0</code> is declaration order — the first characteristic declared is index 0.
			</li>
			<li>
				<code>char()</code> without a <code>service()</code> rides the default Environmental
				Sensing service, which is where 2A6E belongs.
			</li>
			<li>
				Requires a board with a BLE radio — the XIAO nRF52840 target in the config file is the
				primary one. On a board without one, this program is a compile-time error, not a
				runtime surprise.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Flash and read it</h3>
		<div class="mt-2">
			<CodeBlock code={create + '\n' + flash} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Open a BLE scanner app (nRF Connect, LightBlue), find <code>TempSensor</code>, and subscribe
			— the temperature rolls in every two seconds. Breathe on the sensor and watch it climb.
		</p>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/hal/docs/ble" class="font-bold text-primary underline">Bluetooth Low Energy</a>
				— services, permissions, notify, and connection events
			</li>
			<li>
				<a href="/hal/docs/sensors" class="font-bold text-primary underline">Sensors</a>
				— part tokens, channels, and the typed <code>get()</code>
			</li>
			<li>
				<a href="/hal/docs/communication-buses" class="font-bold text-primary underline">Communication buses</a>
				— I2C devices and addresses
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
