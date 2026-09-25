<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const simExample = `import { createSimBoard } from '@typecad/hal/sim';

const board = createSimBoard({ digitalPinCount: 14 });
const pin = board.digital(13);

pin.asOutput();
pin.write(1);
if (!pin.isHigh()) throw new Error('pin did not set');

pin.injectValue(0);                       // pretend the wire changed
if (!pin.isLow()) throw new Error('inject failed');

const history = pin.getHistory();         // every write, with timestamps`;

	const i2cMock = `import { createSimBoard } from '@typecad/hal/sim';

const board = createSimBoard({});
const i2c = board.i2c(0);

// a minimal BME280: respond to register reads
i2c.attachDevice(0x76, {
  read(register: number, count: number): number[] {
    if (register === 0xD0) return [0x60];   // chip id
    return new Array(count).fill(0);
  },
  write(register: number, data: number[]): void {},
});

const id = i2c.device(0x76).read(0xD0, 1);
if (id[0] !== 0x60) throw new Error('wrong chip');

i2c.getLog();        // every read/write with address, register, data, timestamp
i2c.clearLog();`;

	const spiMock = `// SPI mocks are keyed by chip-select pin
const board = createSimBoard({});
const spi = board.spi(0);
const cs = board.digital(10);

spi.attachDevice(cs, {
  transfer(mosi: number[]): number[] {
    return [0xEF, 0x40, 0x18];               // JEDEC id bytes
  },
});

const id = spi.device(cs).readRegister(0x9F, 3);`;

	const simulates = [
		['SimDigitalPin', 'write/read/toggle, input pulls, injected values, write history'],
		['SimAnalogPin', 'inject raw counts or volts, resolution and reference voltage'],
		['SimPWMPin', 'duty writes, percent readback'],
		['SimInterruptPin', 'fire interrupts and pin transitions by hand'],
		['SimSerialPort', 'print/write into a TX buffer you can peek at, inject RX bytes'],
		['SimI2CBus', 'attach mock devices, operation log, NACK on unknown addresses'],
		['SimSPIBus', 'attach mock devices by chip-select pin, transfer logs']
	];
</script>

<svelte:head>
	<title>Hardware Simulation — typeCAD/hal docs</title>
	<meta
		name="description"
		content="@typecad/hal/sim runs your firmware logic in Node.js against a simulated board — virtual pins and buses, mock I2C/SPI devices, no hardware attached."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Hardware Simulation</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	<code>@typecad/hal/sim</code> runs your program's logic in Node.js against a simulated board —
	virtual pins, buses, and mock devices. No board attached, no flashing: CI jobs and
	failure-path tests that would be impossible on real hardware.
</p>

<ApiCard
	name="createSimBoard"
	kind="function"
	purpose="Builds a SimBoard — a virtual board with the pin and bus populations you ask for. Typed
		accessors (.digital(n), .i2c(0), ...) throw if that pin or bus doesn't exist, so the sim
		stays honest about the hardware."
	imports={"import { createSimBoard } from '@typecad/hal/sim'"}>
	{#snippet example()}
		<CodeBlock code={simExample} label="sim.test.ts" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">SimBoardConfig</h3>
	<DocsTable
		headers={['Option', 'Default', 'Meaning']}
		rows={[
			['digitalPinCount', '14', 'Digital pins'],
			['analogPinCount', '6', 'Analog-capable pins'],
			['i2cBusCount / spiBusCount / uartCount', '1', 'Bus population'],
			['pwmPins / interruptPins', '[]', 'Pins with PWM or interrupt capability'],
			['uartRxBufferSize / uartTxBufferSize', '256', 'Serial buffer sizes (bytes)']
		]}
		monoCols={[0, 1]} />
	<Callout>
		Already have a board target? <code>createBoardFromManifest()</code> builds a SimBoard from
		the project's generated <code>.typecad-hal/board.json</code> — same pin map, same
		capabilities, no hardware.
	</Callout>
</ApiCard>

<ApiCard
	name="mock devices"
	kind="pattern"
	purpose="Attach JavaScript objects as I2C/SPI peripherals: scripted register responses for the
		happy path, empty reads for fault injection, and an operation log proving exactly what your
		code put on the wire."
	imports={"board.i2c(0).attachDevice(address, device)"}>
	{#snippet example()}
		<CodeBlock code={i2cMock} label="i2c-mock.ts" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">SPI — keyed by chip select</h3>
	<CodeBlock code={spiMock} label="spi-mock.ts" class="mt-2" />
	<Callout>
		An I2C read from an address with no attached device fires the bus error handler — the same
		NACK your firmware would see on real hardware.
	</Callout>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">What can be simulated</h2>
<div class="mt-4">
	<DocsTable headers={['Simulator class', 'What it does']} rows={simulates} monoCols={[0]} />
</div>

<Callout label="Device builds can't import it">
	<code>@typecad/hal/sim</code> is host-only: a program that will be flashed to a board fails the
	build with a pointing diagnostic if it imports the simulator.
</Callout>
