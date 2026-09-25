<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const testExample = `import { describe, done } from '@typecad/hal/testing';
import { GPIO, LED, ADC } from '@typecad/hal';
import { LED_PIN, ADC_PIN } from '@typecad/test-pins';

describe('board sanity')
  .it('LED output reads back')
  .expect((() => {
    const led = new GPIO(LED_PIN, GPIO.OUTPUT);
    led.set(true);
    return led.get();
  })).toBe(true)
  .it('ADC reads in range')
  .expect((): number => new ADC(ADC_PIN).read())
  .toBeWithinRange(0, 4095);

done();   // required — ends the suite`;

	const numericMatchers = [
		['toBe(value)', 'Equal'],
		['toNotBe(value)', 'Not equal'],
		['toBeGreaterThan(n) / toBeGreaterThanOrEqual(n)', 'Ordering'],
		['toBeLessThan(n) / toBeLessThanOrEqual(n)', 'Ordering'],
		['toBeCloseTo(n, precision?)', 'Rounded comparison (default precision 2)'],
		['toBeWithinRange(min, max)', 'Inclusive bounds'],
		['toBeTruthy / toBeFalsy', 'Non-zero / zero'],
		['expect(() => ...)', 'Pass a zero-arg function — it runs on the board and the return value is checked']
	];

	const stringMatchers = [
		['toBe(text) / toNotBe(text)', 'Exact match'],
		['toContain(text)', 'Substring'],
		['toHaveLength(n)', 'Length check']
	];

	const testFlags = [
		['--port, -p', 'Serial port — overrides config and TYPECAD_HAL_PORT'],
		['--baud', 'Baud rate (default 115200)'],
		['--timeout, -t', 'Suite timeout in ms (default 30000)'],
		['--include, -i / --exclude, -x', 'Glob filters (repeatable)'],
		['--config <path>', 'A different config file'],
		['--discover', 'List USB serial ports with VID:PID'],
		['--dry-run', 'Show what would run'],
		['--bail', 'Stop on the first failure'],
		['--verbose, -v', 'Chatty output']
	];

	const testConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  board: 'xiao_ble/nrf52840',
  test: {
    port: 'COM4',           // required in config — or use the flag / env var
    baudRate: 115200,
    timeout: 30000,
    include: ['tests/**/*.test.ts'],
  },
};

export default config;`;

	const skipDirectives = `// @typecad-skip-target esp32s3: needs the ADC calibration
// @typecad-only-target xiao_ble
// @typecad-requires-roles pwm, cs — skipped unless the board supplies them`;
</script>

<svelte:head>
	<title>Testing &amp; Diagnostics — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Hardware tests with @typecad/hal/testing: the expect API, running on the board with typecad-hal test, role pins, skip directives, and source-mapped C++ errors."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Testing &amp; Diagnostics</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Hal tests are <strong>hardware-in-the-loop</strong>: the test file is flashed to the board, the
	assertions evaluate on real hardware, and pass/fail comes back over serial — one command, no
	test framework to install.
</p>

<ApiCard
	name="@typecad/hal/testing"
	kind="module"
	purpose="A testing-library-style chain: describe → it → expect → done. The comparing happens on
		the host; the firmware only ships raw values over serial. done() must be the last statement —
		it ends the suite."
	imports={"import { describe, done } from '@typecad/hal/testing'"}>
	{#snippet example()}
		<CodeBlock code={testExample} label="tests/sanity.test.ts" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Numeric matchers</h3>
	<DocsTable headers={['Matcher', 'Checks']} rows={numericMatchers} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">String matchers (expectString)</h3>
	<DocsTable headers={['Matcher', 'Checks']} rows={stringMatchers} monoCols={[0]} />
	<Callout>
		No async tests, no beforeEach/afterEach, sequential execution — the board runs one file per
		flash, top to bottom.
	</Callout>
</ApiCard>

<ApiCard
	name="typecad-hal test"
	kind="command"
	purpose="Finds test files (tests/**/*.test.ts by default), transpiles, flashes, and evaluates the
		assertions. Also available as typecad-hal build --expect to test right after a build."
	imports={"typecad-hal test"}>
	{#snippet example()}
		<CodeBlock code={`typecad-hal test
typecad-hal test --port COM4 --include tests/sanity.test.ts`} label="terminal" />
	{/snippet}
	<DocsTable headers={['Flag', 'Meaning']} rows={testFlags} monoCols={[0]} />

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">The test config section</h3>
	<CodeBlock code={testConfig} label="typecad-hal.config.ts" class="mt-2" />
	<p class="mt-2 text-sm leading-relaxed">
		Port resolution: <code>--port</code> flag, then the <code>TYPECAD_HAL_PORT</code> env var,
		then <code>test.port</code> in the config.
	</p>
</ApiCard>

<ApiCard
	name="role pins"
	kind="pattern"
	purpose="Tests written against roles instead of part numbers run on any board. The virtual module
		'@typecad/test-pins' provides LED_PIN, BUTTON_PIN, ADC_PIN, PWM_PIN, CS_PIN, INT_PIN,
		GPIO_OUT, GPIO_IN, I2C_BUS and facts like ADC_MAX — a project-local test-pins.json maps each
		role onto the real pin."
	imports={"import { LED_PIN } from '@typecad/test-pins'"}>
	{#snippet example()}
		<CodeBlock
			code={`{
  "pins": { "led": "LED", "gpioOut": "PA1", "gpioIn": "PA2" },
  "facts": { "adcMax": 4095 }
}`}
			label="test-pins.json" />
	{/snippet}

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Per-target skips</h3>
	<p class="text-sm leading-relaxed">
		Comment directives scope a file to the boards where it makes sense:
	</p>
	<CodeBlock code={skipDirectives} label="directives.ts" class="mt-2" />
</ApiCard>

<ApiCard
	name="source-mapped diagnostics"
	kind="reference"
	purpose="When the generated C++ fails to compile, the error points at your TypeScript line — not
		the generated file. Source maps ride along with every build; add --diagnostics for the full
		report (pin usage, peripheral allocation, memory estimates) as Markdown or JSON."
	imports={"typecad-hal build --compile --diagnostics"}>
	{#snippet example()}
		<CodeBlock
			code={`error: 'i2c_device' was not declared
  at src/main.ts:15:8 (emitted at out/main.cpp:42:10)`}
			label="terminal" />
	{/snippet}
	<Callout>
		Builds are incremental — the lint/typecheck gate result is cached and
		<code>TYPECAD_HAL_NO_CACHE=1</code> bypasses it when a run looks haunted.
	</Callout>
</ApiCard>
