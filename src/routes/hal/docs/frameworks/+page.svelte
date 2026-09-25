<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const zephyrConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  board: 'blackpill_f411ce/stm32f411xe',
  framework: '@typecad/framework-zephyr',
  zephyr: {
    kconfig: { CONFIG_MAIN_STACK_SIZE: '4096' },
    cmakeArgs: ['-DCONFIG_ASSERT=y'],
    probe: 'stlink',            // named probe method — or 'runner' below
    runnerArgs: ['--snr', '000000000'],
  },
};

export default config;`;

	const nativeConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  framework: 'native',
  native: {
    compiler: 'g++',
    cxxStandard: 'c++17',
    includePaths: ['./vendor/include'],
    libraries: ['sdl2'],
    warnings: 'extra',          // none | basic | all | extra | error
    staticLink: true,
  },
};

export default config;`;

	const compare = [
		['Target', 'Microcontrollers — ESP32, nRF52, RP2040, STM32', 'Your desktop — Windows, macOS, Linux'],
		['Under the hood', 'Zephyr kernel, devicetree, west', 'Plain C++ compiled with g++ / clang++'],
		['number', 'int (long when values overflow)', 'long long'],
		['Timers', 'Thread for background work', 'setTimeout / setInterval exist too'],
		['Hardware', 'The real thing — pins, buses, radios', 'Simulated pins; SDL for UI screens'],
		['Best at', 'Shipping firmware', 'Fast logic tests and UI iteration without hardware']
	];

	const zephyrFacts = [
		['Toolchain', 'Installed with npx --package @typecad/framework-zephyr zephyr-installer — selective platforms keep the download small'],
		['Board targets', 'Every variant in your Zephyr tree — see Boards & Targets. Zephyr ≥4.3 <5.0 supported, checked at build time'],
		['Probes', 'Named probe methods per board (stlink, jlink, dfu, uf2, picotool, openocd...) — zephyr.probe picks one; zephyr.runner overrides west\u2019s runner directly'],
		['Kconfig & CMake', 'zephyr.kconfig and zephyr.cmakeArgs feed straight into the west build'],
		['PSRAM', "psram: 'opi' | 'quad' emits the right Kconfig for boards that have it"]
	];

	const limits = [
		'Real-time radios (WiFi, BLE, MQTT, HTTP) exist only on radio-capable targets',
		'No OTA, USB host, CAN/TWAI, I2S audio, Ethernet, or hardware crypto as HAL operations — rawCpp() is the escape hatch',
		'No C++ exceptions or RTTI — throw compiles to a deliberate halt loop; try/catch is a build error',
		'No C++ standard library containers — TS arrays and strings lower to fixed static buffers'
	];
</script>

<svelte:head>
	<title>Frameworks — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Zephyr for real hardware, native for your desktop — the same TypeScript, two build targets, and the config blocks that drive each."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Frameworks</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	A framework is where your program runs. <strong>Zephyr</strong> is the flagship: real boards,
	real hardware, production firmware. <strong>Native</strong> compiles the same TypeScript to a
	desktop binary — no hardware, instant iteration, useful before the board arrives.
</p>

<ApiCard
	name="Zephyr"
	kind="framework"
	purpose="Production firmware on Zephyr RTOS boards. The framework package installs and verifies
		the toolchain, generates out-of-tree boards for contract hardware, and lowers every HAL
		operation to its Zephyr API (gpio_pin_toggle_dt, k_msleep, k_uptime_get, and friends)."
	imports={"framework: '@typecad/framework-zephyr'"}>
	{#snippet example()}
		<CodeBlock code={zephyrConfig} label="typecad-hal.config.ts" />
	{/snippet}
	<DocsTable headers={['What', 'How it works']} rows={zephyrFacts} />
</ApiCard>

<ApiCard
	name="Native"
	kind="framework"
	purpose="A desktop C++ target built into the engine. Same language surface, no hardware layer —
		digital reads return low, and the UI system renders through SDL instead of a display panel."
	imports={"framework: 'native'"}>
	{#snippet example()}
		<CodeBlock code={nativeConfig} label="typecad-hal.config.ts" />
	{/snippet}
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Choosing</h2>
<div class="mt-4">
	<DocsTable headers={['', 'Zephyr', 'Native']} rows={compare} />
</div>

<Callout label="What hal doesn't do — on any framework">
	<ul class="ml-4 list-disc space-y-1 text-sm leading-relaxed">
		{#each limits as limit}
			<li>{limit}</li>
		{/each}
	</ul>
</Callout>
