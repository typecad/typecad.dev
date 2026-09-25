<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const shiftExample = `import { shiftOut, shiftIn } from '@typecad/hal';

shiftOut(dataPin, clockPin, 0b10110001);        // MSB-first by default
const b = shiftIn(dataPin, clockPin);           // reads 8 bits`;

	const randomExample = `import { Random } from '@typecad/hal';

Random.seed(0xC0FFEE);               // only when you want reproducibility
const die = Random.upTo(6);          // 0-5
const pct = Random.between(1, 101);  // 1-100
const big = Random.int();            // non-negative 31-bit integer`;

	const shiftMethods = [
		['shiftOut(data, clock, value, msbFirst?)', 'Send a byte out'],
		['shiftIn(data, clock, msbFirst?)', 'Read a byte in']
	];

	const randomMethods = [
		['Random.seed(v)', 'Seed the PRNG — only needed for deterministic sequences (tests, simulations)'],
		['Random.upTo(max)', '0 up to (but not including) max'],
		['Random.between(min, max)', 'Inclusive integer range'],
		['Random.int()', 'Non-negative 31-bit integer']
	];
</script>

<svelte:head>
	<title>Signal Utilities — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Shift-register helpers and the random generator. For square waves, a PWM channel at 50% duty does it in two calls."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Signal Utilities</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Two small helpers that don't own a peripheral: the shift-register functions and the random
	generator. For a square wave on a buzzer, a <code>PWM</code> channel at 50% duty does it in two
	calls — <code>setPeriod(1_000_000_000 / hz)</code> then <code>setDuty(0.5)</code>; see
	<a href="/hal/docs/analog-pwm" class="font-bold text-primary underline">Analog &amp; PWM</a>.
</p>

<ApiCard
	name="shiftOut / shiftIn"
	kind="functions"
	purpose="Send and receive bytes through a shift register."
	imports={"import { shiftOut, shiftIn } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={shiftExample} label="shift.ts" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All functions</h3>
	<DocsTable headers={['Function', 'Description']} rows={shiftMethods} monoCols={[0]} />
</ApiCard>

<ApiCard
	name="Random"
	kind="singleton"
	purpose="The random generator. Seeded from hardware entropy at boot, so seed() is only needed for
		deterministic sequences (tests, simulations)."
	imports={"import { Random } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={randomExample} label="random.ts" />
	{/snippet}
	<MethodDoc name="upTo" signature="Random.upTo(max): number" returns="0 … max−1">
	</MethodDoc>
	<MethodDoc name="between" signature="Random.between(min, max): number" returns="inclusive range">
	</MethodDoc>
	<MethodDoc name="int" signature="Random.int(): number" returns="31-bit non-negative">
	</MethodDoc>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Method', 'Description']} rows={randomMethods} monoCols={[0]} />
</ApiCard>
