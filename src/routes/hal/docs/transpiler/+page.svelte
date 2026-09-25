<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';

	const typeMap = [
		['number', 'int — widened to long long when values overflow'],
		['boolean / string', 'bool / const char* — no heap strings'],
		['uint8_t, int32_t, size_t...', 'Pass straight through — declare them in TS'],
		['Arrays', 'Fixed C arrays (Zephyr) or std::vector (native)'],
		['Objects', 'Anonymous structs — struct _config_t { ... }'],
		['Set / Map / Record', 'std::set / std::map'],
		['Unions', 'std::variant — | null drops the null side'],
		['?? and ?.', 'Helpers that preserve 0/false and missing objects'],
		['Template literals', 'Fixed char buffers + snprintf with inferred format specifiers'],
		['enum-like unions', 'enum class : uint8_t — narrowed to the smallest fitting integer']
	];

	const rawCpp = `import { include, rawCpp, rawCppExpr, board, callback } from '@typecad/hal';

include('hal/my_driver.h');

// statement form — emitted verbatim
rawCpp('my_driver_calibrate(&hdev);');

// expression form — usable inline
const id = rawCppExpr<number>('my_chip_id()');

// compile-time constants from the board manifest
const flashKb = board('boardDetails.flashKb');

// mark a function as an interrupt callback
callback(() => {
  count++;
});`;

	const lowering = [
		['Pin handles', 'led.toggle() → gpio_pin_toggle_dt(&__tc_dt_led) — devicetree resolved at build time'],
		['Ownership types', 'Owned/Shared/Mutable erase — Shared just adds const; no wrappers, no refcounting'],
		['let → const', 'Whole-program analysis promotes never-reassigned lets to C++ const — ROM and constant folding'],
		['volatile', 'Globals shared with interrupts get volatile automatically'],
		['throw', 'Compiles to a deliberate halt loop on Zephyr — there are no exceptions'],
		['Tree-shaking', 'Unreachable code never reaches the .cpp — reachability from the entry point']
	];

	const validators = [
		'Pin capabilities and pin-mode configuration',
		'Peripheral validation and peripheral ownership (take/release)',
		'Pin alias conflicts and unsafe pins',
		'Interrupt safety — which operations block inside an ISR',
		'Reentrancy detection for shared state',
		'ADC range checks against the board data',
		'Unit suspicion (millis vs micros class mistakes)',
		'Memory budget — statics + estimated stack vs the board\u2019s RAM',
		'Blocking delays in loops',
		'Network usage — HTTP without a radio, weak AP passwords',
		'Ownership analysis — the Owned/Shared/Mutable checks',
		'Try/catch validation'
	];
</script>

<svelte:head>
	<title>The Transpiler — typeCAD/hal docs</title>
	<meta
		name="description"
		content="How hal turns TypeScript into firmware: the pipeline, the TS→C++ type mapping, build-time directives like rawCpp and board(), and what gets erased or promoted."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">The Transpiler</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Hal doesn't interpret your TypeScript — it compiles it: parse to an AST, build an IR, run the
	validators, emit C++, and hand the result to the toolchain. Source maps connect every emitted
	line back to yours, so C++ errors point at TypeScript.
</p>

<ApiCard
	name="type mapping"
	kind="reference"
	purpose="The TypeScript you write decides the C++ you get. Plain, predictable rules — nothing
		dynamic survives to the board, because there's nowhere to put it."
	imports={"TypeScript → C++"}>
	{#snippet example()}
		<DocsTable headers={['TypeScript', 'C++']} rows={typeMap} monoCols={[0]} />
	{/snippet}
</ApiCard>

<ApiCard
	name="build-time directives"
	kind="functions"
	purpose="Escape hatches that disappear at build time. They're real functions when you type-check
		or test in Node — and become raw C++, an include line, or a board constant in the output."
	imports={"import { rawCpp, board } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={rawCpp} label="native.ts" />
	{/snippet}
	<MethodDoc
		name="board()"
		signature="board(path: string): unknown"
		params={[
			{ name: 'path', type: 'string', description: "Dot path into the board manifest — 'boardDetails.flashKb', 'pins.all.13.capabilities.pwm', 'peripherals.i2c.count'" }
		]}>
		<p>
			Returns <code>undefined</code> in plain Node, a compile-time constant in the emitted C++ —
			size buffers and branch on hardware facts without runtime cost.
		</p>
	</MethodDoc>
</ApiCard>

<ApiCard
	name="what gets erased and promoted"
	kind="reference"
	purpose="The abstractions cost nothing at runtime — the transpiler removes them while keeping
		the program's meaning, and promotes what it can prove into cheaper code."
	imports={"zero-cost abstractions"}>
	{#snippet example()}
		<DocsTable headers={['Feature', 'What the build does with it']} rows={lowering} />
	{/snippet}
	<Callout>
		The inverse also runs: a <code>const</code> whose contents get mutated is demoted to a
		mutable binding — with an info diagnostic, so the surprise never reaches the compiler.
	</Callout>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">The validators</h2>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Every build runs the full validator set against the IR — the mistakes that would be a debug
	session on hardware are build errors here. Off-board (simulator) or skipped with
	<code>--skip-type-check</code>, they're your call.
</p>
<ul class="ml-6 mt-3 list-disc space-y-1 text-sm leading-relaxed">
	{#each validators as validator}
		<li>{validator}</li>
	{/each}
</ul>
