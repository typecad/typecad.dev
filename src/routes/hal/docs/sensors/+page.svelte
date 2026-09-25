<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const i2cSensor = `import { I2C0, Sensor, SENSOR, CHAN, Time, UART0 } from '@typecad/hal';

// SHT3X temperature/humidity breakout at I2C address 0x44
const sht3x = new Sensor(SENSOR.sensirion_sht3xd, I2C0.device(0x44));

while (true) {
  sht3x.fetch();                               // take one measurement
  const temp = sht3x.get(CHAN.AMBIENT_TEMP);   // read a channel from it
  const rh = sht3x.get(CHAN.HUMIDITY);         // ...same measurement

  UART0.writeLine(temp + ' C, ' + rh + ' %RH');
  Time.sleep(2000);
}`;

	const spiSensor = `import { SPI0, PA4, Sensor, SENSOR, CHAN } from '@typecad/hal';

// BME280 on SPI, chip select wired to PA4
const bme = new Sensor(SENSOR.bosch_bme280, SPI0.device(PA4));

bme.fetch();
const pressure = bme.get(CHAN.PRESS);   // hectopascals`;

	const spiFast = `// 10 MHz, SPI mode 3 (CPOL=1, CPHA=1)
const bme = new Sensor(SENSOR.bosch_bme280, SPI0.device(PA4), { spiHz: 10000000, mode: 3 });`;

	const typedChannels = `const t = sht3x.get(CHAN.AMBIENT_TEMP);  // fine
const p = sht3x.get(CHAN.PRESS);         // build error — the SHT3XD has no pressure channel`;

	const sensorMethods = [
		['new Sensor(part, busDevice, opts?)', 'Part token + I2C/SPI device; spiHz, mode, alert for SPI parts'],
		['fetch()', 'Take one measurement'],
		['get(channel)', 'Read one channel from the last fetch']
	];

	const limits = [
		['Buses', 'Only I2C and SPI attachments — a part that binds on another bus is rejected with an error naming its real buses'],
		['Alert pins', 'Parts whose binding declares an alert-gpios (the SHT3XD, for example) take an alert option wired to a pin'],
		['Unscanned parts', 'A handful of parts have no scanned channel list; those accept any channel name and let the driver answer at runtime']
	];
</script>

<svelte:head>
	<title>Sensors — typeCAD/hal docs</title>
	<meta
		name="description"
		content="One sensor class that works with every Zephyr sensor driver — over 200 parts, on I2C or SPI. Name the part and the bus; the build produces the rest."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Sensors</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	One sensor class works with over 200 parts, on I2C or SPI. You don't install a library per
	sensor — you name the part and the bus, and the build handles the rest.
</p>

<ApiCard
	name="Sensor"
	purpose="A sensor driver instance. Make it from a part token and a bus device, then fetch() and
		get(): one measurement, many channel values."
	imports={"import { Sensor, SENSOR, CHAN } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={i2cSensor} label="sht3x.ts" />
	{/snippet}

	<MethodDoc
		name="fetch"
		signature="fetch(): void"
		returns="measurement taken">
		<p>Takes the measurement.</p>
	</MethodDoc>

	<MethodDoc
		name="get"
		signature="get(channel): number"
		params={[
			{
				name: 'channel',
				type: 'CHAN.*',
				units: 'driver units',
				description: 'One channel of the last fetch — e.g. CHAN.AMBIENT_TEMP. The sensor\'s type narrows to the part: a wrong channel is a build error naming the channels the driver serves.'
			}
		]}>
		<p>Reads one channel from the last <code>fetch()</code>.</p>
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">SPI sensors</h3>
	<p class="text-sm leading-relaxed">
		The same class takes an SPI bus device — the chip-select pin is part of the device. SPI sensors
		run at 1 MHz by default, which every part in the catalog tolerates; pass options as a third
		argument to run faster or change the mode. The bus argument is checked against the part: hand
		an SPI-only part an <code>I2C0.device(...)</code> and the editor rejects it before you build.
	</p>
	<CodeBlock code={spiSensor} label="bme280-spi.ts" class="mt-3" />
	<CodeBlock code={spiFast} label="bme280-fast.ts" class="mt-3" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Picking a part</h3>
	<p class="text-sm leading-relaxed">
		<code>SENSOR.</code> lists every supported part, with a short description and its buses on
		hover. The name is the part's compatible string with commas and dashes replaced by underscores:
		the SHT3XD's compatible is <code>sensirion,sht3xd</code>, so the token is
		<code>SENSOR.sensirion_sht3xd</code>. Channels use the same names minus the
		<code>SENSOR_CHAN_</code> prefix — <code>SENSOR_CHAN_AMBIENT_TEMP</code> in a datasheet means
		<code>CHAN.AMBIENT_TEMP</code> here.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Typed channels</h3>
	<CodeBlock code={typedChannels} label="typed-channels.ts" />
	<p class="mt-2 text-sm leading-relaxed">
		The error names the channels the driver actually serves, so the fix is on the screen.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={sensorMethods} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Limits</h3>
	<DocsTable headers={['Aspect', 'Behavior']} rows={limits} />
</ApiCard>
