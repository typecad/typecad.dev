<script lang="ts">
	import { type ExampleStub } from '$lib/examples';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	// written next — cards appear here now, pages follow
	const stubs: ExampleStub[] = [
		{
			title: 'BLE temperature sensor',
			blurb: 'Advertise a GATT characteristic that reports the board temperature to your phone.'
		},
		{
			title: 'WiFi connect and HTTP',
			blurb: 'Join a network, poll an endpoint, and put the link events to work.'
		},
		{
			title: 'MQTT publish and subscribe',
			blurb: 'Report sensor readings to a broker and react to commands coming back.'
		},
		{
			title: 'Boot counter that survives re-flashing',
			blurb: 'Store and File side by side — settings, logs, and the storage guarantee.'
		},
		{
			title: 'Read a sensor',
			blurb: 'SHT3X over I2C: pick a part token, fetch, and read typed channels.'
		}
	];
</script>

<svelte:head>
	<title>Examples — typeCAD/hal</title>
	<meta
		name="description"
		content="Complete typeCAD/hal firmware projects: blinking LEDs, sensors, networking, and storage — the whole flow end to end."
	/>
</svelte:head>

<section class="theme-hal flex flex-1 flex-col bg-background text-foreground">
	<div class="mx-auto w-full max-w-5xl px-6 py-10">
		<nav class="text-xs text-muted-foreground" aria-label="Breadcrumb">
			<a href="/hal" class="hover:text-foreground hover:underline">hal</a> /
			<span class="text-foreground">examples</span>
		</nav>

		<h1 class="mt-3 text-4xl font-bold tracking-tight">🧩 Examples</h1>
		<p class="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
			Complete firmware projects you can copy: create the project, write the TypeScript, flash the
			board. More land here as they're written.
		</p>

		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
			<a
				href="/hal/examples/blink"
				class="group border-2 border-foreground bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
				<span
					class="inline-block bg-primary px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
					example
				</span>
				<span class="mt-3 flex items-center gap-1.5 text-lg font-bold">
					Blink — your first firmware
					<ArrowRight class="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
				</span>
				<span class="mt-2 block text-sm leading-relaxed text-muted-foreground">
					Create the project, toggle the onboard LED, and test it on real hardware — the whole
					flow, in a simulated editor.
				</span>
			</a>

			{#each stubs as stub (stub.title)}
				<div class="border-2 border-foreground/40 bg-card p-5 text-muted-foreground">
					<span
						class="inline-block border border-current px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest">
						in progress
					</span>
					<span class="mt-3 block text-lg font-bold text-foreground">{stub.title}</span>
					<span class="mt-2 block text-sm leading-relaxed">{stub.blurb}</span>
				</div>
			{/each}
		</div>

		<div class="mt-12">
			<a href="/hal/docs" class={buttonVariants({ variant: 'outline' })}>
				Back to the HAL reference
			</a>
		</div>
	</div>
</section>
