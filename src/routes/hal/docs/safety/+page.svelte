<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const safeRead = `import { safe, SafetyFaultCategory } from '@typecad/cuttlefish/safety';
import { GPIO, BUTTON_PIN } from '@typecad/hal';

const pin = new GPIO(BUTTON_PIN, GPIO.INPUT);

safe.read(pin).ok((r) => render(r.value)).fail((r) => {
  // r.value is the 2-of-3 vote anyway — use it with care
  if (r.category === SafetyFaultCategory.Configuration) {
    // the pin is configured as an output — a code bug, not noise
  }
});`;

	const safeWrite = `safe.write(enable_pin, 1).fail((r) => {
  // write-then-readback mismatch — the actuator isn't following
});`;

	const safeVariable = `let position: SafeVariable<number> = SafeVariable(0);

position.set(42);
if (position.valid()) {
  display(position.get());
}
// bit-flip a replica and the XOR invariant repairs it — hasFault() reports it`;

	const safeInt = `let total: SafeInt<number> = SafeInt(2147483640);

total.add(5);          // clamps at INT32_MAX — sticky fault
if (total.hasFault()) {
  log('overflow');
}
total.reset(0);        // clears the fault`;

	const asil = `// @asilD — deepest rule set for this function
function deploy(flux: number): number { ... }

// @asilC — recursion + loop checks
// @asilB — recursion check
// no annotation = quality-managed, no rules`;

	const rules = [
		['Recursion', 'ASIL B and up', 'Any recursive call in a safety function'],
		['Dynamic allocation', 'ASIL D', 'new / array growth outside setup — nothing allocates at runtime'],
		['Unbounded loops', 'ASIL C and up', 'while(true) without a bound'],
		['Initialization', 'ASIL D', 'Variables used in a safety function but never initialized in setup'],
		['Goto', 'ASIL C and up', 'Including the labeled-break shapes']
	];
</script>

<svelte:head>
	<title>Safety-Critical Firmware — typeCAD/hal docs</title>
	<meta
		name="description"
		content="ISO 26262-flavored safety mechanisms: voted GPIO reads, write readback, SEU-resistant SafeVariable, sticky-fault SafeInt, and ASIL comment annotations."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Safety-Critical Firmware</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	A safety surface for the firmware, not a certification: voted and verified I/O,
	radiation-tolerant storage, bounds-checked arithmetic, and ASIL-graded rule checks — all
	compiled into the program you'd have written anyway.
</p>

<ApiCard
	name="safe.read / safe.write"
	kind="functions"
	purpose="I/O with a verdict. read samples the pin three times and votes (2-of-3), then checks the
		pin's mode — reading an output-configured pin is a configuration fault, not a signal fault.
		write verifies with a readback."
	imports={"import { safe } from '@typecad/cuttlefish/safety'"}>
	{#snippet example()}
		<CodeBlock code={safeRead} label="safe-read.ts" />
	{/snippet}
	<CodeBlock code={safeWrite} label="safe-write.ts" class="mt-3" />
	<p class="mt-2 text-sm leading-relaxed">
		Results carry <code>value</code>, <code>category</code> (Signal vs Configuration), a
		<code>code</code> (stuck-high, stuck-low, vote disagreement, mode mismatch, write mismatch),
		and <code>ok()</code> / <code>fail()</code> continuation methods.
	</p>
</ApiCard>

<ApiCard
	name="SafeVariable / SafeInt"
	kind="types"
	purpose="Ambient global types — declared in the generated env file, no import. SafeVariable is
		triple-redundant storage with inverted-redundancy validation: a bit flip in one replica is
		detected and repaired. SafeInt is chainable arithmetic that clamps at the type's limits and
		raises a sticky fault."
	imports={"ambient — no import"}>
	{#snippet example()}
		<CodeBlock code={safeVariable} label="safe-variable.ts" />
		<CodeBlock code={safeInt} label="safe-int.ts" class="mt-3" />
	{/snippet}
</ApiCard>

<ApiCard
	name="ASIL annotations"
	kind="reference"
	purpose="Comment decorators grade functions into the ISO 26262 rule set. Unannotated functions
		are quality-managed and unchecked; annotated ones must satisfy the rules for their level or
		the build fails."
	imports={"// @asilD"}>
	{#snippet example()}
		<CodeBlock code={asil} label="annotations.ts" />
	{/snippet}
	<DocsTable headers={['Rule', 'From', 'Catches']} rows={rules} />
	<Callout label="Honest limits">
		Readback reads the port register — it catches software faults, not a shorted wire. No
		certification, no safety case: the mechanisms and the evidence are yours to deploy.
	</Callout>
</ApiCard>
