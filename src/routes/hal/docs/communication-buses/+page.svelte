<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const singletons = `import { UART0, I2C0, SPI0, PA4 } from '@typecad/hal';

UART0.writeLine('hello');                  // the controller, default 115200
const dev = I2C0.device(0x44);             // device at address 0x44
const id = dev.readReg(0xD0);
const flash = SPI0.device(PA4);            // device behind chip-select PA4`;

	const uartExample = `import { UART, UART0 } from '@typecad/hal';

UART0.writeLine("hello");                        // default 115200 — no construction

const gps = new UART(UART0, { baud: 9600, rxBufferBytes: 128 });

gps.write("$PMTK220,1000*2F\\r\\n");   // no newline appended
gps.writeLine("hello");               // with a newline

if (gps.available() > 0) {            // bytes waiting
  const b = gps.read();               // pop the oldest byte (-1 when empty)
  const next = gps.peek();            // look without consuming
}`;

	const usbExample = `import { USB0 } from '@typecad/hal';

if (!USB0.linked()) {
  USB0.waitLinked(3000);    // bounded wait — returns once the host opens the port
}
USB0.writeLine('hello, host');`;

	const i2cExample = `import { I2C0 } from '@typecad/hal';

const sensor = I2C0.device(0x44);

sensor.writeReg(0xF4, 0x27);            // one-byte register write
const id = sensor.readReg(0xD0);        // one-byte register read
sensor.updateReg(0xF5, 0x0F, 0x02);     // read-modify-write
sensor.write([0x2C, 0x06]);             // raw bytes`;

	const spiExample = `import { SPI0, PA4 } from '@typecad/hal';

const display = SPI0.device(PA4, { hz: 10000000, mode: 0 });

const rx = new Uint8Array(4);
display.transceive([0x42, 0x00, 0x00, 0x00], rx);   // full duplex
display.write([0xAA, 0xBB]);                         // write only
const id = display.readReg(0x00);                    // one-byte register read`;

	const uartMethods = [
		['UART0 / UART1 …', 'Board singletons — ready to use, default 115200'],
		['new UART(UART0, opts?)', 'Only for non-default facts: baud, rxBufferBytes (default 64)'],
		['write(v) / writeLine(v)', 'Send — v is text, a number, or a boolean'],
		['available()', 'Bytes waiting in the receive buffer'],
		['read() / peek()', 'Pop the oldest byte / look without consuming (byte or -1)']
	];

	const i2cMethods = [
		['I2C0.device(address)', 'Handle to the device at a 7-bit address'],
		['new I2CTarget(I2C0, address, opts?)', 'Explicit equivalent, only for a custom bus speed (hz)'],
		['writeReg(r, v)', 'One-byte register write'],
		['readReg(r)', 'One-byte register read'],
		['updateReg(r, mask, v)', 'Read-modify-write'],
		['write(bytes)', 'Raw bytes']
	];

	const spiMethods = [
		['SPI0.device(cs, opts?)', 'Handle to the device behind one chip-select; hz and mode (0-3) set at creation'],
		['new SPITarget(SPI0, cs, opts?)', 'Explicit equivalent'],
		['transceive(tx, rx?)', 'Full-duplex transfer'],
		['write(tx)', 'Write-only transfer'],
		['readReg(r)', 'One-byte register read']
	];

	const usbMethods = [
		['USB0', 'The USB serial port singleton, ready to use'],
		['write(v) / writeLine(v)', 'Send — v is text, a number, or a boolean'],
		['linked() / waitLinked(ms)', 'Host-opened check / bounded blocking wait'],
		['read() / available()', 'Input from the host']
	];
</script>

<svelte:head>
	<title>Communication Buses — typeCAD/hal docs</title>
	<meta
		name="description"
		content="I2C, SPI, UART, and USB come as ready-to-use board singletons — I2C0.device(0x44) hands you a working device handle with nothing else to configure."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Communication Buses</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Four buses come ready to use as board singletons: <code>UART0</code> for serial,
	<code>USB0</code> for the USB console, and <code>I2C0</code>/<code>SPI0</code> for devices.
	<code>I2C0.device(0x44)</code> and <code>SPI0.device(PA4)</code> hand you a working handle to one
	device — an address, or a chip-select — with nothing else to configure. Constructing anything
	yourself only matters for non-default facts: a different baud, a bigger receive buffer, a faster
	bus.
</p>

<ApiCard
	name="The board singletons"
	kind="start here"
	purpose="Every bus the board has is exported, ready to use — numbered by instance when the board
		has more than one: UART0 and UART1, I2C0 and I2C1, SPI0 and SPI1, USB0. A board without a bus
		doesn't export its name — using it is a build error at import, not a runtime surprise."
	imports={"import { UART0, I2C0, SPI0 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={singletons} label="singletons.ts" />
	{/snippet}
</ApiCard>

<ApiCard
	name="I2C"
	kind="bus"
	purpose="Talk to one device at one address. I2C0.device(address) hands back a working handle —
		register verbs callable immediately. (The handle is an I2CTarget instance, a name you'll
		rarely need to type.)"
	imports={"import { I2C0 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={i2cExample} label="i2c.ts" />
	{/snippet}
	<Callout>
		The address is the <strong>7-bit form</strong> (<code>0x44</code>) — never the left-shifted
		8-bit form. To attach a managed sensor driver, pass the same handle to
		<code>new Sensor(...)</code>; register-level access is for parts the catalog doesn't cover.
	</Callout>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={i2cMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="SPI"
	kind="bus"
	purpose={`Talk to one device behind one chip-select. SPI0.device(cs, { hz, mode }) hands back a
		working handle, and the chip select is handled around every operation — there is no
		transaction API to get wrong.`}
	imports={"import { SPI0 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={spiExample} label="spi.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Multiple devices on one bus is the normal shape — one <code>SPI0.device(...)</code> per
		chip-select.
	</p>
	<Callout label="Bus conflicts">
		Two peripherals claiming the same pins fail the build with the conflict named.
	</Callout>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={spiMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="UART"
	kind="bus"
	purpose="A serial port. The UART0 / UART1 singletons work with default facts (115200); construct a
		UART only for a different baud or a bigger receive buffer."
	imports={"import { UART0 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={uartExample} label="uart.ts" />
	{/snippet}
	<Callout>
		<code>read()</code> and <code>peek()</code> return <strong>one byte or −1</strong>. There is no
		line API — frame messages in your program.
	</Callout>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={uartMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="USB"
	kind="bus"
	purpose="The USB serial port the host sees as a COM/tty device. USB0 is ready to use; early output
		written before the host opens the port is dropped by most hosts, so gate it on linked() or
		waitLinked()."
	imports={"import { USB0 } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={usbExample} label="usb.ts" />
	{/snippet}
	<Callout>
		If the board has no USB device controller, USB operations fail at build time.
	</Callout>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={usbMethods} monoCols={[0]} />
</ApiCard>
