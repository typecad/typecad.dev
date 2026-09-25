<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const adcExample = `import { ADC, A1 } from '@typecad/hal';

const sense = new ADC(A1, {
  gain: ADC.GAIN_1_3,
  reference: ADC.REF_INTERNAL,
});

const counts = sense.read();              // raw counts at the chip's resolution
const mv = sense.readMillivolts();        // converted to millivolts`;

	const dacExample = `import { DAC, DAC0 } from '@typecad/hal';

const out = new DAC(DAC0);
out.write(128);       // mid-scale on an 8-bit channel`;

	const pwmExample = `import { PWM } from '@typecad/hal';

const servo = new PWM(6, { periodNs: 20_000_000 });    // 50 Hz
servo.setPulse(1_500_000);                              // 1.5 ms — center

const dimmer = new PWM(7, { periodNs: 1_000_000 });    // 1 kHz LED dimming
dimmer.setDuty(0.5);                                    // fraction 0.0-1.0`;

	const pwmMethods = [
		['new PWM(pin, { periodNs })', 'Construction — the period is required (ns)'],
		['setPulse(ns)', 'Set the pulse width'],
		['setDuty(f)', 'Set the pulse as a fraction of the period'],
		['setPeriod(ns)', 'Changes the period; pulse resets to idle — follow with setPulse/setDuty']
	];

	const apiReference = [
		['new ADC(pin, opts?)', 'gain / reference — ADC.GAIN_* / ADC.REF_* tokens'],
		['read() / readMillivolts()', 'Raw counts / millivolts'],
		['new DAC(pin, opts?)', 'resolution in bits; omitted = chip default'],
		['write(value)', 'Raw code at the channel\'s resolution'],
		['new PWM(pin, { periodNs })', 'Period is required (ns)'],
		['setPulse(ns) / setDuty(f) / setPeriod(ns)', 'Pulse control']
	];
</script>

<svelte:head>
	<title>Analog &amp; PWM — typeCAD/hal docs</title>
	<meta
		name="description"
		content="ADC, DAC, and PWM in raw counts, millivolts, and nanoseconds."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Analog &amp; PWM</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Three classes for varying signals: <code>ADC</code> (analog in), <code>DAC</code> (analog out),
	and <code>PWM</code> (pulse-width out). Construction is the channel setup, and the units are raw
	counts, millivolts, and nanoseconds.
</p>

<ApiCard
	name="ADC"
	purpose="Analog input channel. Construction sets up the channel: gain and reference are constructor
		options, defaulting to the pair your chip's driver validates against when omitted."
	imports={"import { ADC } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={adcExample} label="adc.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Gain and reference are set at construction with <code>ADC.</code> tokens such as
		<code>ADC.GAIN_1_4</code> — a misspelling is an editor error, and an invalid combination is a
		build error naming the valid tokens for your chip.
	</p>
	<MethodDoc name="read" signature="read(): number" returns="raw counts">
		<p>Raw counts at the chip's resolution.</p>
	</MethodDoc>
	<MethodDoc name="readMillivolts" signature="readMillivolts(): number" returns="mV">
		<p>The same channel, converted to millivolts.</p>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="DAC"
	purpose="Analog output channel. Construction carries the resolution in bits (omitted = your chip's
		channel resolution)."
	imports={"import { DAC } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={dacExample} label="dac.ts" />
	{/snippet}
	<MethodDoc
		name="write"
		signature="write(value: number): void"
		params={[
			{
				name: 'value',
				type: 'number',
				units: 'raw code',
				description: '0-255 for an 8-bit channel, 0-4095 for 12-bit — the raw code at the channel\'s resolution.'
			}
		]}>
		<p>Writes the raw code. There is no 0–1 normalized form.</p>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="PWM"
	purpose="Pulse-width output. The period is a required construction fact, in nanoseconds — the
		channel's time base exists before any pulse does."
	imports={"import { PWM } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={pwmExample} label="pwm.ts" />
	{/snippet}
	<MethodDoc
		name="setPulse"
		signature="setPulse(ns: number): void"
		params={[{ name: 'ns', type: 'number', units: 'nanoseconds', description: 'The pulse width.' }]}>
	</MethodDoc>
	<MethodDoc
		name="setDuty"
		signature="setDuty(fraction: number): void"
		params={[{ name: 'fraction', type: 'number', units: '0.0-1.0', description: 'The pulse as a fraction of the constructed period.' }]}>
	</MethodDoc>
	<MethodDoc name="setPeriod" signature="setPeriod(ns: number): void">
		<p>
			Changes the period; the pulse resets to idle, so follow it with
			<code>setPulse</code>/<code>setDuty</code>.
		</p>
	</MethodDoc>
	<Callout label="ESP32">
		Using a pin outside the chip's PWM-capable set is flagged at build time, naming the pins that
		can.
	</Callout>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Member', 'Description']} rows={pwmMethods} monoCols={[0]} />
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">API reference</h2>
<div class="mt-4">
	<DocsTable headers={['Member', 'Description']} rows={apiReference} monoCols={[0]} />
</div>
