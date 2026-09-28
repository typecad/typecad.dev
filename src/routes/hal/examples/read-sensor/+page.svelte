<script lang="ts">
	import WorkspaceViewer from '$lib/components/examples/workspace-viewer.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import { getWorkspaceExample } from '$lib/workspace-examples';
	import { error } from '@sveltejs/kit';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowLeft } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	const example = getWorkspaceExample('read-sensor');
	if (!example) error(404, 'Example not found');

	const create = `npx @typecad/hal create my-project --target xiao_ble/nrf52840
cd my-project`;
	const flash = `npx @typecad/hal build --compile --upload --port COM4`;
	const test = `npx @typecad/hal test

  Sensor
    ✓ reads a plausible temperature
    ✓ reads a plausible humidity

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
			<span class="text-foreground">read-sensor</span>
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
				There's no per-sensor library to install. <code>SENSOR.sensirion_sht3xd</code> names the
				part, <code>I2C0.device(0x44)</code> names the bus and address, and the build produces
				the driver binding.
			</li>
			<li>
				<code>fetch()</code> takes one measurement; <code>get()</code> reads a channel from it.
				Two channels, one fetch — temperature and humidity come from the same reading.
			</li>
			<li>
				The channels are typed to the part: <code>sht3x.get(CHAN.PRESS)</code> is a build error
				naming the channels the SHT3XD actually serves. The wrong sensor call is caught before
				it ships, not when it reads garbage.
			</li>
			<li>
				The hardware test in <code>test/sensor.test.ts</code> runs on the board itself — a
				plausibility range check (−40 to 85 °C is the SHT3X's operating range) that catches a
				dead sensor or a miswired bus, which a unit test never could.
			</li>
		</ul>

		<h3 class="mt-8 font-bold">Flash and read</h3>
		<div class="mt-2">
			<CodeBlock code={create + '\n' + flash} label="terminal" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Wire the SHT3X breakout to the board's I2C pins (SDA, SCL, 3V3, GND — the ADDR pin floating
			gives 0x44). Open a serial monitor at 115200 and the readings roll every two seconds:
		</p>
		<div class="mt-2">
			<CodeBlock code={`21.64 C, 44.2 %RH\n21.65 C, 44.3 %RH`} label="serial monitor" />
		</div>
		<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
			Then run the test — same board, same sensor, assertions on real hardware:
		</p>
		<div class="mt-2">
			<CodeBlock code={test} label="terminal" />
		</div>

		<h2 class="mt-12 text-2xl font-bold tracking-tight">Where to go next</h2>
		<ul class="ml-6 mt-3 list-disc space-y-1 text-sm">
			<li>
				<a href="/hal/docs/sensors" class="font-bold text-primary underline">Sensors</a>
				— the 200-part list, SPI attachments, and typed channels
			</li>
			<li>
				<a href="/hal/docs/communication-buses" class="font-bold text-primary underline">Communication buses</a>
				— I2C and SPI device handles
			</li>
			<li>
				<a href="/hal/examples/ble-temperature" class="font-bold text-primary underline">BLE temperature sensor</a>
				— this sensor, advertised over BLE
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
