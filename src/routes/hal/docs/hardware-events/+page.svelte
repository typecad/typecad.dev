<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const attach = `import { GPIO, LED, BUTTON } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);
const button = new GPIO(BUTTON, GPIO.INPUT | GPIO.PULL_UP);

button.onInterrupt(GPIO.INT_EDGE_FALLING, () => {
  led.toggle();
});`;

	const detach = `button.offInterrupt();   // disable and remove the callback`;

	const flagPattern = `let pressed = false;
button.onInterrupt(GPIO.INT_EDGE_FALLING, () => { pressed = true; });

while (true) {
  if (pressed) {
    pressed = false;
    UART0.writeLine('pressed');   // safe here
  }
  Time.sleep(10);
}`;

	const tokens = [
		['GPIO.INT_EDGE_RISING', 'the pin goes low → high'],
		['GPIO.INT_EDGE_FALLING', 'the pin goes high → low'],
		['GPIO.INT_EDGE_BOTH', 'either transition'],
		['GPIO.INT_LEVEL_LOW', 'the pin is held low'],
		['GPIO.INT_LEVEL_HIGH', 'the pin is held high']
	];

	const vsPolling = [
		['Latency', 'microseconds', 'the poll period (typically milliseconds)'],
		['Context', 'ISR constraints apply', 'none — ordinary code'],
		['Best at', 'events that must not be missed', 'sequential logic, debouncing'],
		['Many inputs', 'one callback per pin', 'one task can watch many conditions']
	];
</script>

<svelte:head>
	<title>Hardware Events — typeCAD/hal docs</title>
	<meta
		name="description"
		content="GPIO interrupts with edge/level tokens. Blocking calls in handlers are flagged at build time."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Hardware Events</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Attach a handler to a pin with an edge or level token, and it fires when the pin changes — the
	way hardware interrupts always have, without the setup ceremony.
</p>
<p class="mt-3 text-sm leading-relaxed">
	For sequential "wait for a signal" logic, interrupts are the wrong tool — poll inside an
	<code>async function</code> with <code>Time.sleep</code> and let the task yield between checks.
</p>

<ApiCard
	name="onInterrupt / offInterrupt"
	kind="method group"
	purpose="Attach and detach a GPIO interrupt with an edge or level token — a misspelled token is
		an editor error; an invalid mode is a build error naming the valid spellings."
	imports={"import { GPIO } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={attach} label="interrupts.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Mode tokens</h3>
	<DocsTable headers={['Token', 'Fires when']} rows={tokens} monoCols={[0]} />

	<MethodDoc name="offInterrupt" signature="offInterrupt(): void">
		<CodeBlock code={detach} label="detach.ts" class="mt-1" />
	</MethodDoc>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">ISR safety</h3>
	<p class="text-sm leading-relaxed">
		The handler runs in interrupt context. Setting variables and driving pins in the handler is
		fine, but calls that would block — delays, bus transactions, UART writes — are flagged at
		build time with the offending call named. The pattern that always works: set a flag in the
		handler, act on it in the main flow.
	</p>
	<CodeBlock code={flagPattern} label="flag-pattern.ts" class="mt-3" />
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Interrupts or polling?</h2>
<div class="mt-4">
	<DocsTable headers={['', 'Interrupt', 'Poll in an async task']} rows={vsPolling} />
</div>
<p class="mt-4 text-sm leading-relaxed">
	Debouncing is the classic deciding case: an interrupt fires on every bounce, while a polling task
	reads a settled level. <code>while (button.get()) {'{'} await Time.sleep(20); {'}'}</code>
	debounces by construction.
</p>
