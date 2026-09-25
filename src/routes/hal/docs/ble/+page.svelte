<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const minServer = `import { BLE, BleValueType, BlePerm, Time } from '@typecad/hal';

const ble = new BLE('TempSensor');

ble.char('2A6E', BleValueType.Int16, BlePerm.Read)
   .onRead(() => 2180);      // 21.80 °C — int16, 0.01 °C units per GATT 2A6E

ble.start();                 // register the database, enable the stack, advertise

while (true) {
  Time.sleep(1000);
}`;

	const multiService = `ble.service('180F')                          // Battery Service
   .char('2A19', BleValueType.Uint8, BlePerm.Read | BlePerm.Notify)
   .onRead(() => batteryPercent());

ble.notify(0, batteryPercent());             // push to subscribers — index is
                                             // declaration order, 0-based`;

	const writeHandler = `ble.service('180A')
   .char('2A56', BleValueType.Int32, BlePerm.Write)
   .onWrite((value) => { setpoint = value; });`;

	const connectionEvents = `ble.onConnect(() => UART0.writeLine('central connected'));
ble.onDrop(() => UART0.writeLine('central disconnected'));   // advertising stays armed`;

	const bleMethods = [
		['new BLE(name)', 'Construct the peripheral; the name is the advertised identity'],
		['service(uuid)', 'Begin a service grouping for subsequent char() calls'],
		['char(uuid, type, perms)', 'Append a characteristic (to the default service when no service() precedes it)'],
		['.onRead(fn) / .onWrite(fn)', 'Handlers for the most recently declared characteristic; chainable'],
		['start()', 'Register the GATT database, enable the stack, begin advertising'],
		['stop()', 'Stop advertising — the database and any link stay up'],
		['linked() / clients()', 'Connection state and count (single-connection: 0 or 1)'],
		['onConnect(fn) / onDrop(fn)', 'Connection callbacks'],
		['notify(index, value)', 'Push a value to subscribers — index is declaration order (0-based)']
	];

	const valueTypes = [
		['BlePerm.Read / Write / Notify', 'Permission flags — combine with |'],
		['BleValueType.Int8 / Int16 / Int32', 'Signed GATT value types'],
		['BleValueType.Uint8 / Uint16 / Uint32', 'Unsigned GATT value types']
	];
</script>

<svelte:head>
	<title>Bluetooth Low Energy — typeCAD/hal docs</title>
	<meta
		name="description"
		content="A thin BLE GATT peripheral server: declare the database with service()/char() chains, handlers bind where the characteristic is declared."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Bluetooth Low Energy (BLE)</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	BLE is one class: <code>new BLE('name')</code> carries the advertised device name, and the GATT
	database is declared with <code>service()</code>/<code>char()</code> chains. Handlers bind to the
	characteristic they immediately follow in the chain — declare them right where the characteristic
	is declared.
</p>

<Callout label="Targets">
	BLE requires a board with a BLE radio and Zephyr board support for it; the Seeed XIAO nRF52840
	(<code>xiao_ble</code> target) is the primary target.
</Callout>

<ApiCard
	name="BLE"
	purpose="A GATT peripheral server. Construct it with the advertised name, declare services and
		characteristics as chains, attach read/write handlers inline, then start(). char() without a
		preceding service() attaches to the default Environmental Sensing service — the common
		single-service case."
	imports={"import { BLE, BlePerm, BleValueType } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={minServer} label="temp-sensor.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Multiple services and characteristics</h3>
	<p class="text-sm leading-relaxed">
		Chain declarations; each <code>service()</code> begins a grouping, and each <code>char()</code>
		appends to the most recent one. Read and write handlers:
	</p>
	<CodeBlock code={multiService + '\n\n' + writeHandler} label="gatt.ts" class="mt-3" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Permissions and value types</h3>
	<DocsTable headers={['Tokens', 'Description']} rows={valueTypes} monoCols={[0]} />
	<p class="mt-2 text-sm leading-relaxed">
		Pick the GATT spec's type for the characteristic you implement.
	</p>

	<MethodDoc name="onConnect / onDrop" signature="onConnect(fn): BLE">
		<CodeBlock code={connectionEvents} label="events.ts" class="mt-1" />
		<p class="mt-2">
			<code>linked()</code> is true while a central is connected; <code>clients()</code> reports the
			count. <code>stop()</code> stops advertising; the database and any link stay up.
		</p>
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={bleMethods} monoCols={[0]} />
</ApiCard>
