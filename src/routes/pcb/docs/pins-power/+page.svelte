<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const numericPins = `import { Resistor } from '@typecad/passives/0805'
let r1 = new Resistor({ value: '1kohm' });

r1.pin(1);      // first pin
r1.pin(2);      // second pin`;

	const namedPins = `import { ATtiny85_20S } from './ATtiny85_20S';
let u1 = new ATtiny85_20S();

u1.VCC      // power pin (internally pin 8)
u1.GND      // ground pin (internally pin 4)
u1.PB0      // GPIO pin PB0`;

	const powerInfoExample = `VCC = this.pin(8, { type: 'power_in', powerInfo: {
  minimum_voltage: -0.5,
  maximum_voltage: 6,
  current: 0.2,
}});`;

	const powerExample = `import { Component, Power } from '@typecad/pcb';

let bt1 = new Component({ footprint: 'Battery:BatteryHolder_Keystone_3008_1x2450' });
let coin_cell = new Power({
    power: bt1.pin(1),  // Pin 1 is the positive terminal → type set to 'power_out'
    gnd: bt1.pin(2),    // Pin 2 is the ground terminal → type set to 'power_in'
    voltage: 3.7,       // Nominal voltage
    current: 0.5,       // Current capacity
    direction: 'output' // This is a power source (default)
});`;

	const regulatorExample = `// U1 is a voltage regulator, pin 2 is shared ground
let vin = new Power({ power: U1.pin(1), gnd: U1.pin(2), voltage: 5, direction: 'input' });
let vout = new Power({ power: U1.pin(3), gnd: U1.pin(2), voltage: 3.3, direction: 'output' });`;

	const inputPower = `// 'vin' is an input Power object passed as a parameter
typecad.net(vin.power, U1.VCC);
typecad.net(vin.gnd, U1.GND);`;

	const voltageCheck = `if (vin.voltage != 3.3) {
    throw new Error('Voltage must be 3.3v');
}`;

	const powerOptions = [
		['power', 'Pin', 'Pin that supplies power'],
		['gnd', 'Pin', 'Pin that supplies ground'],
		['voltage', 'number', 'Volts'],
		['current', 'number', 'Current capacity'],
		['direction', "'output' | 'input'", "'output' (default) for power sources, 'input' for power consumers"]
	];

	const powerInfoProps = [
		['minimum_voltage', 'Volts the pin can tolerate (minimum)'],
		['maximum_voltage', 'Volts the pin can tolerate (maximum)'],
		['current', 'Maximum current the pin can handle (A)']
	];

	const pinTypes = [
		['direction: output', 'power_out', 'power_in'],
		['direction: input', 'power_in', 'power_in']
	];
</script>

<svelte:head>
	<title>Pins &amp; Power — typeCAD/pcb docs</title>
	<meta name="description" content="The Pin object represents a pin/leg/lead/ball of a component; the Power class makes the design power-aware." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Pins &amp; Power</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The <code>Pin</code> object represents the pin/leg/lead/ball of a component. When pins carry
	power information, typeCAD checks voltage levels and current draw for compatibility — that's the
	power-aware system, and <code>Power</code> is how a source or consumer enters it.
</p>

<ApiCard
	name="Pin"
	purpose="One pin of a component. Two access styles: numeric for simple parts, named for complex
		ones. An optional powerInfo object makes the pin power-aware."
	imports={"import { Component } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={numericPins} label="numeric.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Numeric access — component.pin(n)</h3>
	<p class="text-sm leading-relaxed">
		Use for simple components like passives where pin numbers are straightforward.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Named access — component.PINNAME</h3>
	<p class="text-sm leading-relaxed">
		Use for complex components (ICs, connectors) with a generated <code>.ts</code> file where
		<code>Pin</code> objects are defined:
	</p>
	<CodeBlock code={namedPins} label="named.ts" class="mt-2" />

	<MethodDoc
		name="pin (config)"
		signature={"this.pin(number, { type, powerInfo }): Pin"}
		params={[
			{ name: 'type', type: 'string', units: 'KiCAD type', description: "e.g. 'power_in', 'power_out', 'bidirectional' — used by ERC" },
			{ name: 'powerInfo', type: 'object', description: 'Optional — enables voltage and current compatibility checks' }
		]}>
		<p>The <code>powerInfo</code> properties:</p>
		<div class="mt-3">
			<DocsTable headers={['Property', 'Meaning']} rows={powerInfoProps} monoCols={[0]} />
		</div>
		<p class="mt-3 text-sm leading-relaxed">
			With data present, typeCAD checks that connected pins have compatible voltage levels and
			current draw — errors or warnings when the voltage is too high or the draw too much:
		</p>
		<CodeBlock code={powerInfoExample} label="pin-config.ts" class="mt-2" />
	</MethodDoc>
</ApiCard>

<ApiCard
	name="Power"
	purpose="Extra information used for ERC (pin types), voltage compatibility checks, and automatic
		trace width calculation. A Power object represents a physical set of pins, not an abstract
		concept of power or ground."
	imports={"import { Power } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={powerExample} label="coin-cell.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Options</h3>
	<DocsTable headers={['Option', 'Type', 'Description']} rows={powerOptions} monoCols={[0, 1]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">How pin types are set</h3>
	<p class="text-sm leading-relaxed">
		When a <code>Power</code> object is created, pin types are set automatically for ERC — the
		<code>gnd</code> pin is <strong>always</strong> <code>power_in</code>, regardless of direction:
	</p>
	<div class="mt-3">
		<DocsTable headers={['direction', 'power pin type', 'gnd pin type']} rows={pinTypes} monoCols={[1, 2]} />
	</div>
	<p class="mt-2 text-sm leading-relaxed">
		<code>voltage</code> and <code>current</code> propagate to the pins' <code>powerInfo</code>,
		used by ERC for voltage checks and by the routing system for trace width calculation.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Shared ground pins</h3>
	<p class="text-sm leading-relaxed">
		Voltage regulators often have power inputs and outputs sharing one ground pin. Since
		<code>gnd</code> is always <code>power_in</code>, this typically works without conflict; override
		the pin type manually if ERC needs it:
	</p>
	<CodeBlock code={regulatorExample} label="regulator.ts" class="mt-2" />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Input Power</h3>
	<p class="text-sm leading-relaxed">
		An input <code>Power</code> specifies the power requirements of a component or sub-circuit —
		commonly passed into reusable packages so users can connect a suitable source:
	</p>
	<CodeBlock code={inputPower} label="package-power.ts" class="mt-2" />
	<p class="mt-3 text-sm leading-relaxed">A package can check the incoming voltage as well:</p>
	<CodeBlock code={voltageCheck} label="voltage-check.ts" class="mt-2" />
</ApiCard>
