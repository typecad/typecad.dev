<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const safeRead = `import { safe, SafetyFaultCategory } from '@typecad/cuttlefish/safety';
import { GPIO, LED, BUTTON } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);
const input = new GPIO(BUTTON, GPIO.INPUT);

safe.read(input).ok((r) => led.set(r.value > 0)).fail((r) => {
  // r.value is 0 on any fault — it is not a reading, don't use it
  if (r.category === SafetyFaultCategory.Configuration) {
    // the pin is configured as an output — a code bug, not noise
    led.set(false);
  }
});`;

	const safeWrite = `import { safe } from '@typecad/cuttlefish/safety';
import { GPIO, LED } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);
const enable = new GPIO(5, GPIO.OUTPUT);   // any output pin

safe.write(enable, 1).fail((r) => {
  // write-then-readback mismatch — the actuator isn't following
  led.set(false);
});`;

	const safeVariable = `import { GPIO, LED } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);

let position: SafeVariable<number> = SafeVariable(0);

position.set(42);
if (position.valid()) {
  led.set(position.get() > 0);
}
// flip one replica: its XOR check fails, the other two outvote it, get() stays right,
// and valid() turns false. hasFault() is for when no trustworthy value is left.`;

	const safeInt = `import { GPIO, LED } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);

let total: SafeInt<number> = SafeInt(2147483640);

total.add(5);          // would overflow INT32_MAX — value stays 2147483640, sticky fault
if (total.hasFault()) {
  led.set(false);      // the fault handler's to call
}
total.reset(0);        // clears the fault`;

	const asil = `import { GPIO, LED } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);

// @asilD — deepest rule set for this function
function deploy(flux: number): number {
  return flux * 2;
}

// @asilC — recursion + loop + goto checks
function check(flux: number): boolean {
  return flux > 10;
}

// @asilB — recursion check
function clamp(flux: number): number {
  return flux > 100 ? 100 : flux;
}

// @asilA, or no annotation = quality-managed, no rules
led.set(check(clamp(deploy(6))));`;

	const rules = [
		['Recursion', 'ASIL B and up', 'Error', 'Any recursive call in a safety function'],
		['Dynamic allocation', 'ASIL D', 'Error', 'new / malloc / array growth outside setup — nothing allocates at runtime'],
		['Unbounded loops', 'ASIL C and up', 'Warning', 'while(true), for(;;) and do-while(true) without a bound'],
		['Initialization', 'ASIL D', 'Warning', 'Variables used in a safety function but never initialized in setup'],
		['Goto', 'ASIL C and up', 'Info', 'Reported for awareness, including the labeled-break shapes']
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
		<code>code</code> (vote disagreement, mode mismatch, mode unknown, write mismatch), and <code>ok()</code> / <code>fail()</code> continuation methods. The pin must be one the compiler can resolve — an untrackable pin argument is a build error.
	</p>
</ApiCard>

<ApiCard
	name="SafeVariable / SafeInt"
	kind="types"
	purpose="Ambient global types — declared in the generated env file, no import. SafeVariable is
		triple-redundant storage with inverted-redundancy validation: a bit flip in one replica is detected (valid() turns false) and outvoted; hasFault() reports when no trustworthy value remains. SafeInt is chainable arithmetic that pre-checks every operation, keeps the last good value on overflow and raises a sticky fault."
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
		are quality-managed and unchecked. Annotated ones are checked against the rules for their level: errors fail the build, warnings and info are reported, and every result is recorded in the safety sidecar."
	imports={"// @asilD"}>
	{#snippet example()}
		<CodeBlock code={asil} label="annotations.ts" />
	{/snippet}
	<DocsTable headers={['Rule', 'From', 'Severity', 'Catches']} rows={rules} />
	<Callout label="Honest limits">
		Readback reads the port register — it catches software faults, not a shorted wire. No
		certification, no safety case: the mechanisms and the evidence are yours to deploy.
	</Callout>
</ApiCard>
