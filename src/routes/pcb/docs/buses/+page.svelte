<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const i2cExample = `import { I2C } from '@typecad/pcb';
import { ATtiny85_20S } from './ATtiny85_20S';

let u1 = new ATtiny85_20S();
let i2c = new I2C(u1.PB0, u1.PB1);    // SDA on PB0, SCL on PB1

typecad.create(u1, i2c);`;

	const uartExample = `import { UART } from '@typecad/pcb';

let serial = new UART(u1.PB2, u1.PB3);              // rx, tx
let flow   = new UART(u1.PB2, u1.PB3, u1.PB4, u1.PB5); // + rts, cts`;

	const usbExample = `import { USB } from '@typecad/pcb';

let usb = new USB(u1.DP, u1.DN);      // USB D+ and D- pins`;
</script>

<svelte:head>
	<title>Buses — typeCAD/pcb docs</title>
	<meta name="description" content="I2C, UART, and USB pin pairings — construct from the component's pins and include with create()." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Buses</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Three thin classes that tie bus pins together on the schematic: <code>I2C</code>, <code>UART</code>,
	and <code>USB</code>. Construct one from the component's pins and include it with
	<code>create()</code> alongside the components.
</p>

<ApiCard
	name="I2C"
	purpose="An I2C bus — the SDA and SCL pins, tied together for the schematic."
	imports={"import { I2C } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={i2cExample} label="i2c.ts" />
	{/snippet}
	<MethodDoc
		name="constructor"
		signature="new I2C(sda: Pin, scl: Pin): I2C"
		params={[
			{ name: 'sda', type: 'Pin', description: 'The data line pin' },
			{ name: 'scl', type: 'Pin', description: 'The clock line pin' }
		]}>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="UART"
	purpose="A UART serial port — receive and transmit pins, with optional hardware flow control."
	imports={"import { UART } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={uartExample} label="uart.ts" />
	{/snippet}
	<MethodDoc
		name="constructor"
		signature="new UART(rx: Pin, tx: Pin, rts?: Pin, cts?: Pin): UART"
		params={[
			{ name: 'rx', type: 'Pin', description: 'Receive pin' },
			{ name: 'tx', type: 'Pin', description: 'Transmit pin' },
			{ name: 'rts', type: 'Pin', description: 'Optional — request to send' },
			{ name: 'cts', type: 'Pin', description: 'Optional — clear to send' }
		]}>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="USB"
	purpose="A USB port — the D+ and D- differential pair."
	imports={"import { USB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={usbExample} label="usb.ts" />
	{/snippet}
	<MethodDoc
		name="constructor"
		signature="new USB(DP: Pin, DN: Pin): USB"
		params={[
			{ name: 'DP', type: 'Pin', description: 'USB D+ pin' },
			{ name: 'DN', type: 'Pin', description: 'USB D- pin' }
		]}>
	</MethodDoc>
</ApiCard>
