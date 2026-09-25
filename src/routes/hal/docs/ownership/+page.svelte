<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const ownedExample = `import { UART0 } from '@typecad/hal';

let packet: Owned<number[]> = buildPacket();
let archived = packet;   // ownership moves — 'packet' no longer has it

UART0.writeLine(String(packet.length));
// ✗ error: 'packet' was moved and cannot be used again`;

	const sharedExample = `import { UART0 } from '@typecad/hal';

const view: Shared<number[]> = readings;   // zero-copy, read-only
const limit: Shared = config.threshold;    // primitives borrow by value

UART0.writeLine(String(view.length));      // reading is what it's for

view = filtered;
// ✗ error: Cannot assign to 'view' — it is an immutable borrow
//   hint: change 'view: Shared<number[]>' → 'view: Mutable'`;

	const mutableExample = `function scale(values: Mutable<number[]>, factor: number) {
  for (let i = 0; i < values.length; i++) {
    values[i] = values[i] * factor;   // writes reach the caller's array
  }
}

scale(samples, 0.5);   // in place — no copy, nothing returned`;

	const byValueExample = `function zero(reading: Reading) {   // no annotation — passed by value
  reading.value = 0;
  // ⚠ changes are invisible to the caller
  //   hint: use 'reading: Mutable<Reading>' to pass by reference (T&)
}`;

	const lowering = [
		['(no annotation)', 'A private copy — every assignment copies', 'C++ value'],
		['Owned<T>', 'You own the value; assigning it moves it', 'C++ value — use after the move is an error'],
		['Shared<T>', 'Read-only borrow — as many as you like', 'const — non-primitives borrow as const T&'],
		['Mutable<T>', 'A writable borrow — the one place writes are allowed', 'T& for non-primitives; writes reach the source']
	];

	const checks = [
		['Use after move', 'error', "Reading a variable whose ownership already moved — 'was moved and cannot be used again'"],
		['Assign to Shared', 'error', 'Writing through an immutable borrow — the hint says exactly what to change to Mutable'],
		['Update to Shared', 'error', '++ / -- through an immutable borrow'],
		['Shared passed as Mutable', 'error', "A read-only borrow handed to something that writes — 'expects a mutable borrow'"],
		['Dangling borrow', 'error', "Returning a borrow of a local — 'destroyed when this function returns'"],
		['Borrowing a temporary', 'warning', 'Shared/Mutable initialized from a call result — C++ cannot reference an rvalue, so it falls back to a copy'],
		['Silent copy', 'info', 'An unannotated non-primitive assigned from a variable — suggests Shared for zero-copy'],
		['Const suggestion', 'info', "A let never reassigned emits as C++ const — the compiler can place it in ROM and fold it"]
	];
</script>

<svelte:head>
	<title>Owned, Shared &amp; Mutable — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Ownership annotations for hal programs: Owned moves, Shared borrows read-only, Mutable borrows writable — checked at transpile time and lowered to the matching C++."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Owned, Shared &amp; Mutable</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	A hal program becomes C++, and these three type annotations decide the memory behind it: who
	owns a value, who may read it, and who may write it. They are checked at transpile time — the
	mistakes that become dangling pointers and surprise copies in C++ are errors and warnings here.
</p>
<ul class="ml-6 mt-3 list-disc space-y-1 text-sm text-muted-foreground">
	<li><strong>Owned&lt;T&gt;</strong> — the value is yours. Assigning it to someone else moves it; using it afterward is refused.</li>
	<li><strong>Shared&lt;T&gt;</strong> — a read-only borrow. Zero copy, any number of them, and nothing can be written through one.</li>
	<li><strong>Mutable&lt;T&gt;</strong> — a writable borrow. Writes through it reach the original.</li>
</ul>

<ApiCard
	name="Owned<T>"
	purpose="Marks a value you own. Assignment transfers ownership, and the transpiler tracks the
		transfer: the source becomes unusable, so use-after-move bugs never reach the board."
	imports="no import — ambient in every hal project">
	{#snippet example()}
		<CodeBlock code={ownedExample} label="owned.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Every unannotated variable already behaves this way — assignment copies, and each copy is its
		own value. What <code>Owned</code> adds is the tracking: the move is recorded and a later use
		of the source is an error.
	</p>
	<Callout>
		Moving a non-primitive is really a C++ <em>copy</em>, so the transpiler says so — an info
		suggesting <code>const archived: Shared = packet;</code> when a borrow would do. It only
		points when there is a cheaper option.
	</Callout>
</ApiCard>

<ApiCard
	name="Shared<T>"
	purpose="A read-only borrow: the data stays where it is and you get a const view of it. Non-primitives
		lower to const T& — no copy at all; primitives borrow by value as const."
	imports="no import — ambient in every hal project">
	{#snippet example()}
		<CodeBlock code={sharedExample} label="shared.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Any number of <code>Shared</code> borrows of one value can coexist — that is the point of
		immutable data. Writing through one is refused at transpile time, with a hint that names the
		<code>Mutable</code> annotation that would allow it.
	</p>
</ApiCard>

<ApiCard
	name="Mutable<T>"
	purpose="A writable borrow. The function that receives one can change what it points at, and the
		changes are visible to the caller — no copies, no return values, no out parameters."
	imports="no import — ambient in every hal project">
	{#snippet example()}
		<CodeBlock code={mutableExample} label="mutable.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Non-primitives lower to <code>T&amp;</code>. Primitives stay passed by value — a borrow of an
		<code>int</code> saves nothing — so annotate the arrays, strings, and structs.
	</p>
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Why parameters want it</h3>
	<p class="text-sm leading-relaxed">
		An unannotated struct parameter arrives as a copy, and mutating that copy silently does
		nothing to the caller's value:
	</p>
	<CodeBlock code={byValueExample} label="by-value.ts" class="mt-2" />
	<p class="mt-3 text-sm leading-relaxed">
		The transpiler catches this pattern — <code>changes are invisible to the caller</code> — and
		the fix is the annotation: <code>reading: Mutable&lt;Reading&gt;</code> passes by reference
		so the write lands.
	</p>
</ApiCard>

<ApiCard
	name="bus ownership — take / release"
	kind="pattern"
	purpose="Memory isn't the only thing worth owning. Buses are shared hardware, and the same
		opt-in model guards them: take a bus before using it, release it when you're done. I2C0,
		I2C1, SPI0, SPI1, and UART0 are recognized."
	imports={"const bus = I2C0.take()"}>
	{#snippet example()}
		<CodeBlock
			code={`const i2c = I2C0.take();

const sensor = i2c.device(0x44);
const reading = sensor.readReg(0x00);

i2c.release();   // other code may take it now`}
			label="bus-ownership.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Nothing is emitted — <code>take()</code> returns the same bus object; the ownership is a
		compile-time claim. The validator checks the discipline:
	</p>
	<ul class="ml-6 mt-2 list-disc space-y-1 text-sm leading-relaxed">
		<li>Taking an already-taken bus — error, with the fix in the hint</li>
		<li>Releasing, or doing I/O on, a bus nobody took — error</li>
		<li>Taken and never released — warning (a leak, not necessarily a bug)</li>
	</ul>
	<Callout>
		Like the memory types, it's opt-in: if <code>take()</code> never appears in your program, no
		bus-ownership diagnostics run.
	</Callout>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">The configuration is the setup</h2>
<p class="mt-3 leading-relaxed text-muted-foreground">
	There is no <code>begin()</code>. Peripherals are ready the moment your program runs, because
	construction <em>is</em> the configuration — the arguments you pass become devicetree nodes,
	Kconfig lines, and guarded one-time driver calls, not runtime state.
</p>
<ul class="ml-6 mt-3 list-disc space-y-1 text-sm leading-relaxed">
	<li>Use-before-configure can't happen — there is no configure step to skip</li>
	<li>Double-configure can't happen — the facts are compile-time, applied once before main()</li>
	<li>Two peripherals claiming the same pins is a build error (conflict detection)</li>
	<li>Requesting a peripheral the board lacks is a module-resolution error</li>
</ul>
<p class="mt-3 text-sm leading-relaxed">
	Runtime verbs that genuinely reconfigure — <code>PWM.setPeriod()</code>,
	<code>WiFi.leave()</code> — are ordinary methods on a configured object, not a second
	constructor.
</p>

<h2 class="mt-12 text-2xl font-bold tracking-tight">What each one lowers to</h2>
<div class="mt-4">
	<DocsTable
		headers={['Annotation', 'Meaning', 'C++ the transpiler emits']}
		rows={lowering}
		monoCols={[0]} />
</div>

<h2 class="mt-12 text-2xl font-bold tracking-tight">The checks</h2>
<p class="mt-3 leading-relaxed text-muted-foreground">
	All of this runs while your program is transpiled — nothing on the board, nothing at runtime.
	Errors stop the build; warnings and infos explain themselves in the output.
</p>
<div class="mt-4">
	<DocsTable headers={['Check', 'Severity', 'When it fires']} rows={checks} monoCols={[1]} />
</div>

<Callout label="Opt-in, and invisible to TypeScript">
	If none of the three names appear in your program, none of these checks run — existing code
	behaves exactly as before. And because the annotations are ambient type aliases (generated into
	the project's type declarations, no import), TypeScript itself sees nothing special:
	<code>Shared&lt;Sensor&gt;</code> is plain <code>Sensor</code> to the type checker. Only the
	transpiler reads them.
</Callout>

<Callout label="Advanced — how function parameters default">
	A user-defined struct or interface parameter is borrowed <code>const T&amp;</code> even with no
	annotation — copies are expensive and accidental mutations should be errors. <code>Shared</code>
	and <code>Mutable</code> extend that borrowing to containers like arrays and strings;
	primitives only gain <code>const</code> when explicitly annotated
	<code>Shared</code>.
</Callout>
