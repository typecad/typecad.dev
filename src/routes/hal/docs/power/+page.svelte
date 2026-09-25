<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const off = `import { Power, Time } from '@typecad/hal';

// flush whatever matters — RAM is not retained past off()
saveSettings();

await Time.sleep(500);   // let the serial line drain
Power.off();             // enters soft-off — this line never "returns"`;

	const wakeStory = `// after off(), the board wakes by:
//   • reset — the power / EN button
//   • a wake source — ESP32: a GPIO armed as a wake trigger;
//     STM32: the WKUP pin (PA0 on the Black Pill)
//
// and boot starts over — setup runs from the top, like power-on.`;

	const batteryCycle = `import { Power } from '@typecad/hal';

// the classic battery pattern: read, publish, sleep, repeat
const readings = await sampleSensors();
await publish(readings);

Power.offFor(60_000);   // soft-off; the RTC wakes the board in one minute
// boot starts from the top — microamps in between`;
</script>

<svelte:head>
	<title>Power &amp; Sleep — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Power.off() enters the deepest power state — soft-off, never returning; light sleep states belong to the kernel's idle policy and happen on their own."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Power &amp; Sleep</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Two power realities, two different owners. <strong>Light sleep</strong> — standby,
	suspend-to-idle — belongs to the kernel's idle policy: it happens automatically whenever nothing
	is running, and there is nothing to call. <strong>Soft-off</strong> — the deepest state — is
	explicit-entry only: <code>off()</code> for good, <code>offFor(ms)</code> for a timed sleep.
</p>

<ApiCard
	name="Power"
	kind="singleton"
	purpose="The power-state surface. off() enters the deepest declared power state — deep
		sleep / soft-off — via sys_poweroff(). The call doesn't return."
	imports={"import { Power } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={off} label="power-down.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		Expect the console to go silent — <strong>that silence is the effect</strong>. RAM isn't
		retained; there is no resuming the program after <code>off()</code>.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Waking back up</h3>
	<CodeBlock code={wakeStory} label="wake.ts" class="mt-2" />
	<p class="mt-2 text-sm leading-relaxed">
		Arming a wake source happens on the pin side — an ESP32 GPIO configured as a wake trigger,
		or the STM32 WKUP pin. <code>off()</code> only enters the state; what may end it is decided
		before you call it.
	</p>

	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable
		headers={['Method', 'What it does']}
		rows={[
			['off()', 'Soft-off now — wake by reset or an armed wake source'],
			['offFor(ms)', 'Soft-off with the RTC wake timer armed — reboot after ms milliseconds']
		]}
		monoCols={[0]} />
</ApiCard>

<ApiCard
	name="offFor — the battery cycle"
	kind="method"
	purpose="Sleep for a duration: offFor(ms) arms the SoC's RTC wake timer, then enters soft-off.
		The board reboots on wake (RAM isn't retained), so the semantics are 'sleep for N ms, then
		run from the top' — the shape of every battery-powered sensor."
	imports={"Power.offFor(60_000)"}>
	{#snippet example()}
		<CodeBlock code={batteryCycle} label="duty-cycle.ts" />
	{/snippet}
	<Callout label="Where the wake timer exists">
		The RTC wake timer rides the harvested <code>rtc_timer</code> fact — the ESP32 family has
		one. On boards without the fact, <code>offFor</code> lowers to a comment naming the
		limitation instead of silently sleeping with no way to wake: the same discipline as the
		<a href="/hal/docs/boards" class="font-bold text-primary underline">unsupported-hardware gate</a>,
		just gentler. Pair it with the
		<a href="/hal/docs/clock" class="font-bold text-primary underline">Clock</a> to timestamp
		what the board did before it slept.
	</Callout>
</ApiCard>

<h2 class="mt-12 text-2xl font-bold tracking-tight">Why light sleep isn't a method</h2>
<p class="mt-3 leading-relaxed text-muted-foreground">
	The SoC's devicetree declares its power states as facts, and typeCAD harvests them into the
	board module (<code>zephyr.power.states.*</code> — inspectable with
	<a href="/hal/docs/transpiler" class="font-bold text-primary underline"><code>board()</code></a>).
	Of those, the light states are <em>policy</em>: the kernel enters them when the scheduler has
	nothing to run, which is exactly what an idle embedded program wants. Giving the app a
	"sleep light" verb would only invite fighting the governor — so in v1 there is no op surface
	for it. Your program's job is to reach the idle state; the power savings are automatic.
</p>

<Callout label="Board-gated, like all hardware">
	<code>Power</code> exists only on boards whose SoC declares CPU power states — on anything
	else, importing it fails at module resolution. See
	<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards &amp; Targets</a>.
	Using it emits the build fact automatically (<code>CONFIG_POWEROFF</code>) — without it,
	<code>sys_poweroff()</code> doesn't link.
</Callout>
