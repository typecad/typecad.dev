/** Single source of truth for the /hal/docs section: sidebar categories, hub grid, pager order */

export interface HalDocArea {
	slug: string;
	title: string;
	blurb: string;
}

export interface HalDocGroup {
	title: string;
	areas: HalDocArea[];
}

export const HAL_DOC_GROUPS: HalDocGroup[] = [
	{
		title: 'Start here',
		areas: [
			{
				slug: 'getting-started',
				title: 'Getting started',
				blurb: 'Requirements, the Zephyr toolchain, creating a project, VSCode'
			}
		]
	},
	{
		title: 'Peripherals & I/O',
		areas: [
			{
				slug: 'gpio-digital-io',
				title: 'GPIO & Digital I/O',
				blurb: 'Pin configuration, read/write/toggle, interrupts'
			},
			{
				slug: 'analog-pwm',
				title: 'Analog & PWM',
				blurb: 'ADC channels, DAC channels, PWM output'
			},
			{
				slug: 'communication-buses',
				title: 'Communication Buses',
				blurb: 'UART, USB serial, I2C, SPI — one class per target device'
			},
			{
				slug: 'can',
				title: 'CAN Bus',
				blurb: 'begin/send/onReceive over the harvested controller — loopback mode for the bench'
			},
			{
				slug: 'i2s',
				title: 'I2S — Digital Audio',
				blurb: 'Sample-accurate audio streams — construction carries the wire facts'
			},
			{
				slug: 'hid',
				title: 'USB HID — Keyboard & Mouse',
				blurb: 'Act as a USB keyboard or mouse — boot-protocol reports, hardware tested'
			},
			{
				slug: 'sensors',
				title: 'Sensors',
				blurb: 'One class for 200+ Zephyr sensor drivers on I2C or SPI'
			},
			{
				slug: 'timing',
				title: 'Timing & Clocks',
				blurb: 'Time — sleep, monotonic clocks, busy-wait'
			},
			{
				slug: 'on-chip-peripherals',
				title: 'On-Chip Peripherals',
				blurb: 'Hardware timers (Counter), watchdog'
			},
			{
				slug: 'power',
				title: 'Power & Sleep',
				blurb: 'Power.off() — soft-off entry, never returns; light sleep is the kernel\u2019s job'
			},
			{
				slug: 'clock',
				title: 'Clock (RTC)',
				blurb: 'Wall-clock time in epoch seconds — hardware calendar or counter-backed shim'
			},
			{
				slug: 'hardware-events',
				title: 'Hardware Events',
				blurb: 'GPIO interrupts with Zephyr edge/level tokens'
			},
			{
				slug: 'signal-utilities',
				title: 'Signal Utilities',
				blurb: 'Shift registers, RNG'
			}
		]
	},
	{
		title: 'Networking & data',
		areas: [
			{
				slug: 'networking',
				title: 'Networking (WiFi & HTTP)',
				blurb: 'WiFi join/scan/AP, HTTP client with TLS (ESP32 targets)'
			},
			{
				slug: 'iot-networking',
				title: 'IoT Networking (MQTT)',
				blurb: 'MQTT publish/subscribe over the Zephyr networking stack'
			},
			{
				slug: 'ble',
				title: 'Bluetooth Low Energy',
				blurb: 'BLE GATT peripheral server'
			},
			{
				slug: 'storage',
				title: 'Storage & Persistent Data',
				blurb: 'Store key/value settings, File whole-file storage'
			}
		]
	},
	{
		title: 'UI',
		areas: [
			{
				slug: 'ui',
				title: 'UI',
				blurb: 'Display screens authored in HTML + CSS, compiled to draw calls'
			},
			{
				slug: 'displays',
				title: 'Displays',
				blurb: 'Any panel drop-in: devicetree compatible + wiring — ST7796S, ILI9341, ST7789, GC9A01, with quirk flags for clones'
			}
		]
	},
	{
		title: 'Language & toolchain',
		areas: [
			{
				slug: 'ownership',
				title: 'Owned, Shared & Mutable',
				blurb: 'Ownership annotations — moves, borrows, and the C++ memory each one lowers to'
			},
			{
				slug: 'transpiler',
				title: 'The Transpiler',
				blurb: 'TypeScript → C++: type mapping, rawCpp, what gets erased and promoted'
			},
			{
				slug: 'frameworks',
				title: 'Frameworks',
				blurb: 'Zephyr for real boards, native for your desktop'
			},
			{
				slug: 'boards',
				title: 'Boards & Targets',
				blurb: 'The generated board module, the hardware gateway, custom pin facts'
			},
			{
				slug: 'contracts',
				title: 'Contracts',
				blurb: 'Flash firmware against your own hardware, not a dev board'
			},
			{
				slug: 'cli',
				title: 'The CLI',
				blurb: 'Every typecad-hal command and its flags'
			},
			{
				slug: 'vscode',
				title: 'The VS Code extension',
				blurb: 'Board-aware diagnostics, hovers, quick-fixes, fact chips, and Flash & Monitor — vendored into every project'
			}
		]
	},
	{
		title: 'Test & verify',
		areas: [
			{
				slug: 'testing',
				title: 'Testing & Diagnostics',
				blurb: 'Hardware tests with the expect API, role pins, and source-mapped errors'
			},
			{
				slug: 'tracing',
				title: 'Runtime Tracing',
				blurb: 'CPU load, stack high-water and frame times — sampled on the board, gated in CI, asserted in tests'
			},
			{
				slug: 'simulation',
				title: 'Hardware Simulation',
				blurb: 'Run your logic against a simulated board — mock I2C/SPI devices included'
			},
			{
				slug: 'safety',
				title: 'Safety',
				blurb: 'Voted I/O, SafeVariable, SafeInt, and ASIL-graded checks'
			}
		]
	}
];

/** Flat reading order — drives the hub grid and the prev/next pager */
export const HAL_DOC_AREAS: HalDocArea[] = HAL_DOC_GROUPS.flatMap((g) => g.areas);
