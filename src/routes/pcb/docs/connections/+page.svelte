<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const netExample = `import { Capacitor } from '@typecad/passives/0805'
import { ATtiny85_20S } from './ATtiny85_20S';
import { PCB } from '@typecad/pcb';

let typecad = new PCB('typecad_docs');
let u1 = new ATtiny85_20S();
let c1 = new Capacitor({ value: '1uF' });

typecad.net(u1.VCC, c1.pin(1));     // power
typecad.net(u1.GND, c1.pin(2));     // ground`;

	const namedExample = `typecad.net(u1.VCC, c1.pin(1));              // net#
typecad.named('power').net(u1.VCC, c1.pin(1));  // 'power'`;

	const powerRail = `typecad.named('VCC').net(
  microcontroller.VDD,
  cap1.pin(1),
  cap2.pin(1),
  connector.pin(1)
);`;

	const signals = `typecad.named('SDA').net(microcontroller.PB0, sensor.SDA);
typecad.named('SCL').net(microcontroller.PB1, sensor.SCL);`;
</script>

<svelte:head>
	<title>Connections — typeCAD/pcb docs</title>
	<meta name="description" content="Connections are created by calling PCB::net() with a list of Pin objects — any number at once, optionally named." />
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Connections</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Connections are created by calling <code>PCB::net()</code>. Connections are made between
	components in the same <code>PCB</code>, and the <code>net()</code> function takes a list of
	<code>Pin</code> objects.
</p>

<ApiCard
	name="net"
	kind="method"
	purpose="Connect pins. Takes any number of Pin objects, so multiple pins join one net in a single
		call."
	imports={"import { PCB } from '@typecad/pcb'"}>
	{#snippet example()}
		<CodeBlock code={netExample} label="connections.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		That connects pin 1 of the capacitor to the VCC pin of the ATtiny85 and pin 2 to GND.
	</p>

	<MethodDoc
		name="named"
		signature="pcb.named(name).net(...pins)"
		params={[
			{ name: 'name', type: 'string', description: 'The net name, visible in KiCAD. Some typeCAD utility functions only pay attention to named connections.' }
		]}>
		<p>Sometimes it's useful to name the connection — it shows in KiCAD and helps when laying out the board. Unnamed connections become <code>net#</code>.</p>
		<CodeBlock code={namedExample} label="named.ts" class="mt-3" />
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Common patterns</h3>
	<p class="text-sm leading-relaxed"><strong>Power distribution</strong> — multiple components on one rail:</p>
	<CodeBlock code={powerRail} label="power-rail.ts" class="mt-2" />
	<p class="mt-4 text-sm leading-relaxed"><strong>Signal connections</strong> — buses between ICs:</p>
	<CodeBlock code={signals} label="signals.ts" class="mt-2" />

	<Callout>
		typeCAD <strong>merges nets with similar Pin connections</strong>. If you connect to an
		already-connected pin, the newer net merges into the existing one — so your
		<code>named</code> net may not keep its name if it merges with another net later. You'll see a
		warning in the build output when this happens.
	</Callout>
</ApiCard>
