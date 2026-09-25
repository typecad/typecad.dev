<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';
	import MethodDoc from '$lib/components/docs/method-doc.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	const divider = `import { PCB, Resistor, Power } from '@typecad/pcb';

let typecad = new PCB('typecad');

let r1 = new Resistor({ value: '10k', size: '0603' });
let r2 = new Resistor({ value: '10k', size: '0603' });
let vin = new Power({ power: r1.pin(1), gnd: r2.pin(2), voltage: 5 });

typecad.named('in').net(r1.pin(1));
typecad.named('vdiv').net(r1.pin(2), r2.pin(1));
typecad.named('gnd').net(r2.pin(2));
typecad.add(r1, r2);

const result = typecad.simulate().op();
if (result) {
  console.log(result.getVoltage('vdiv'));         // 2.5 — the divider midpoint
  console.log(result.getCurrent(r1.reference));   // 0.00025 A
  console.log(result.getPower(r1.reference));     // 0.000625 W
}`;

	const cliLoop = `typecad-pcb simulate   # re-runs the entry, solves the OP, writes build/<board>_op.json
# the board viewer's ngspice view reads it — hover a trace for volts / amps / watts`;

	const tran = `const result = typecad.simulate().tran('1u', '10m');
// headless: returns the parsed waveform — no plot windows, no blocking
const v = result?.getWaveform('v(vdiv)');

typecad.simulate().tran('1u', '10m', 0, undefined, false, true);  // openPlots = true`;

	const sweep = `const led = new Power({ power: r1.pin(1), gnd: r2.pin(2), voltage: 5, name: 'VS' });

for (const r of typecad.simulate().dc('VS', 0, 5, 0.25)?.getWaveform('v(vdiv)') ?? []) {
  console.log(r);
}

const ac = typecad.simulate().ac('dec', 20, 10, 1e6);
ac?.getDb('v(vout)');      // Bode-style magnitude
ac?.getPhaseDeg('v(vout)');`;

	const netlisting = [
		['Auto netlisting', 'Passives (R/C/L/D references) join the netlist automatically — no per-component opt-ins'],
		['Rail discovery', 'Power objects already in the circuit stamp voltage ratings on their pins; those rails become the sources. Passing Power objects to simulate() explicitly still works and wins'],
		['simulation.exclude', 'Opts a component out of the netlist'],
		['simulation.model', 'Emits a .model card, e.g. \'DLED D (IS=1a RS=3.3 N=1.8)\''],
		['simulation.subckt + library', 'Instantiates .subckt parts from vendor-style .lib files — include paths are rewritten relative to the netlist'],
		['simulation.pinOrder', 'Maps component pins onto model / subckt terminals'],
		['simulation.params', 'Instance parameters (\'m=2\', area factors, W=/L=…) — named forms only: ngspice 44 rejects positional tokens'],
		['./build/<name>.cir', 'The generated SPICE netlist lands next to the other build output']
	];

	const results = [
		['getVoltage(net)', 'Voltage at a named net — getVoltage(\'vdiv\')'],
		['getCurrent(ref)', 'Current through a component, by reference — getCurrent(\'R1\')'],
		['getPower(ref)', 'Power dissipated in a component, by reference'],
		['get(variable)', 'Any raw result variable by name'],
		['getWaveform(name)', 'The full data column — every point of a tran/dc/ac sweep'],
		['getAt(name, index)', 'One point of a sweep'],
		['getMagnitude / getDb / getPhaseDeg', 'Complex (AC) results as magnitude, dB, or phase in degrees']
	];
</script>

<svelte:head>
	<title>Simulation — typeCAD/pcb docs</title>
	<meta
		name="description"
		content="Run ngspice SPICE simulations on the schematic: simulate().op() for the DC operating point, tran/dc/ac analyses headless — from the same code that defines the board."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Simulation</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The same code that defines the board can SPICE it. <code>simulate()</code> builds a netlist from
	the schematic, hands it to <a
		href="https://ngspice.sourceforge.io"
		class="font-bold text-primary underline">ngspice</a
	> headlessly, and hands you the numbers — operating point, transient, DC sweep, or AC.
</p>

<ApiCard
	name="simulate"
	kind="method"
	purpose="Takes no arguments: passives are netlisted automatically and power rails are discovered
		from the `Power` objects already attached to the circuit. Returns a `SimulationContext` for
		running an analysis. Needs the ngspice binary in your PATH — one of the optional installs
		listed in Getting started."
	imports={"pcb.simulate()"}>
	{#snippet example()}
		<CodeBlock code={divider} label="a 5 V divider, simulated" />
	{/snippet}
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">The netlist</h3>
	<div class="mt-3">
		<DocsTable headers={['Piece', 'Role']} rows={netlisting} monoCols={[0]} />
	</div>
	<Callout>
		No ngspice installed? An analysis returns <code>null</code> instead of throwing — simulation
		code can skip gracefully in CI and on machines without it. On Windows the console binary
		<code>ngspice_con</code> is used.
	</Callout>
</ApiCard>

<ApiCard
	name="Analyses"
	kind="reference"
	purpose="Four analyses, all headless — results come back as a parsed `NgspiceResult`, not plot
		windows. Each writes the netlist to `./build/` first, so what ngspice ran is always
		inspectable."
	imports={".op() · .tran() · .dc() · .ac()"}>
	<MethodDoc name="op" signature="op()" returns="NgspiceResult | null">
		<p>
			Takes no arguments — it solves the DC operating point of the whole circuit, prints a
			formatted table (V / mA / mW) to the console, and the returned result answers questions
			programmatically:
		</p>
		<div class="mt-2">
			<DocsTable headers={['Accessor', 'Reads']} rows={results} monoCols={[0]} />
		</div>
	</MethodDoc>
	<MethodDoc
		name="tran"
		signature="tran(tstep, tstop, tstart?, tmax?, uic?, openPlots?)"
		returns="NgspiceResult | null"
		params={[
			{ name: 'tstep', type: 'string', units: 'time, e.g. 1u', description: 'The time step' },
			{ name: 'tstop', type: 'string', units: 'time, e.g. 10m', description: 'When the analysis stops' },
			{ name: 'tstart', type: 'string', units: 'time', description: 'Optional initial time' },
			{ name: 'tmax', type: 'string', units: 'time', description: 'Optional maximum internal step' },
			{ name: 'uic', type: 'boolean', units: 'true / false', description: 'Use initial conditions' },
			{ name: 'openPlots', type: 'boolean', units: 'true / false', description: 'Pass true for ngspice’s interactive plot windows — default false (headless)' }
		]}>
		<p>
			Transient analysis in batch mode: the waveform comes back parsed, with a final-value
			summary printed instead of a per-point dump:
		</p>
		<div class="mt-2">
			<CodeBlock code={tran} label="terminal" />
		</div>
	</MethodDoc>
	<MethodDoc
		name="dc"
		signature="dc(source, start, stop, increment)"
		returns="NgspiceResult | null"
		params={[
			{ name: 'source', type: 'string', units: 'source name', description: "A named Power source — new Power({ …, name: 'VS' }); auto sources are V1, V2, …" },
			{ name: 'start / stop', type: 'number', units: 'volts', description: 'The sweep bounds' },
			{ name: 'increment', type: 'number', units: 'volts', description: 'The step' }
		]}>
		<p>
			Sweeps a named source. The sweep axis is the <code>v(v-sweep)</code> variable in the
			result.
		</p>
	</MethodDoc>
	<MethodDoc
		name="ac"
		signature="ac(sweep, points, fstart, fstop)"
		returns="NgspiceResult | null"
		params={[
			{ name: 'sweep', type: 'string', units: 'dec | oct | lin', description: 'The sweep type' },
			{ name: 'points', type: 'number', units: 'count', description: 'Points per decade / octave / line' },
			{ name: 'fstart / fstop', type: 'number', units: 'Hz', description: 'The frequency bounds' }
		]}>
		<p>
			Small-signal frequency sweep — give a source a small-signal magnitude with
			<code>ac:</code>, read complex results back with <code>getMagnitude</code> /
			<code>getDb</code> / <code>getPhaseDeg</code> for Bode-style checks:
		</p>
		<div class="mt-2">
			<CodeBlock code={sweep} label="dc sweep + ac analysis" />
		</div>
	</MethodDoc>
	<Callout>
		Power sources also take a <code>waveform</code> — a raw ngspice source expression like
		<code>PULSE(0 5 1m 1u 1u 5m 20m)</code> or <code>SIN(0 1 1k)</code> — for transient drives.
	</Callout>
</ApiCard>

<ApiCard
	name="The CLI loop"
	kind="workflow"
	purpose="`typecad-pcb simulate` solves the operating point for the board viewer: it re-runs the
		project entry exactly like a build, writes `build/<board>_op.json` beside the netlist, and
		the viewer's ngspice view picks it up on the next refresh — trace hover then shows each
		net's voltage and the connected devices' current and power. Operating-point only; for other
		analyses use the API."
	imports={"typecad-pcb simulate"}>
	{#snippet example()}
		<CodeBlock code={cliLoop} label="terminal" />
	{/snippet}
	<Callout>
		See
		<a href="/pcb/docs/vscode" class="font-bold text-primary underline">The VS Code extension</a>
		for the ngspice view itself — voltage heat maps, power-tinted parts, and animated current
		flow.
	</Callout>
</ApiCard>

<ApiCard
	name="When it pays off"
	kind="workflow"
	purpose="Simulation runs in your build code, so the checks travel with the design. Assert the
		divider really divides, the LED current really limits — and fail the build when physics
		disagrees with intent."
	imports={"simulate() in build code"}>
	{#snippet example()}
		<CodeBlock
			code={`const vdiv = typecad.simulate().op()?.getVoltage('vdiv');
if (vdiv !== undefined && Math.abs(vdiv - 2.5) > 0.01) {
  typecad.error(\`divider midpoint is \${vdiv} V, expected 2.5 V\`);
}`}
			label="src/index.ts"
		/>
	{/snippet}
	<Callout>
		See
		<a href="/pcb/docs/pins-power" class="font-bold text-primary underline">Pins &amp; Power</a>
		for the Power class and
		<a href="/pcb/docs/passives" class="font-bold text-primary underline">Passives</a>
		for the parts you'll most often simulate.
	</Callout>
</ApiCard>

<div class="mt-10 flex items-center justify-between border-t-2 border-foreground pt-6 text-sm">
	<a href="/pcb/docs/import" class={buttonVariants({ variant: 'outline' })}>
		Next: Import from KiCAD <ArrowRight class="size-4" />
	</a>
</div>
