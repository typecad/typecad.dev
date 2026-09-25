<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const i2sExample = `import { I2S } from '@typecad/hal';

const audio = new I2S(0, { hz: 16000 });   // I2S0, 16 kHz

// one block of 16-bit samples; a stereo frame is two entries (L, R)
audio.write([1000, -1000, 2000, -2000, 0, 0]);

const first = audio.read();        // starts RX on first use
const second = audio.readAt(1);    // any element of the last block`;

	const loopback = `import { I2S, Time } from '@typecad/hal';

// ONE JUMPER: bridge the board's data-out pad to data-in
// (esp32s3_devkitC i2s0_default: O_SD GPIO38 → I_SD GPIO41)
const audio = new I2S(0, { hz: 16000, channels: 2, blockFrames: 16 });
audio.write([1000, -1000, 2000, -2000]);

Time.sleep(500);               // the DMA clocks the block out and back
const s0 = audio.read();       // 1000
const s1 = audio.readAt(1);    // -1000 — the block, intact`;

	const constructorOpts = [
		['instance', 'number', 'Controller index — 0 is the board\u2019s first (I2S0 on the ESP32 family)'],
		['hz', 'number', 'Sample rate (default 16000)'],
		['channels', 'number', '1 mono / 2 stereo (default 2)'],
		['bits', 'number', 'Bits per sample (16)'],
		['blockFrames', 'number', 'Block granularity in frames — one write/read is one block (default 64)']
	];

	const methods = [
		['write(samples)', 'Send one block — up to blockFrames × channels 16-bit samples; short writes zero-pad. First call configures and starts TX'],
		['read()', 'Receive one block; returns the first sample. First call configures and starts RX'],
		['readAt(index)', 'Element index of the last received block (0 .. blockFrames × channels − 1) — read() must have run first']
	];
</script>

<svelte:head>
	<title>I2S — Digital Audio — typeCAD/hal docs</title>
	<meta
		name="description"
		content="The I2S audio stream, Zephyr-shaped: construction carries the wire facts, first write/read configures its direction, and a one-jumper loopback proves the whole path."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">I2S — Digital Audio</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	One controller per instance — the harvested <code>i2s@</code> devicetree node (I2S0/I2S1 on the
	ESP32 family) — addressed by index and configured entirely at construction: sample rate,
	channels, bit depth, block size. Samples are 16-bit; one block per call.
</p>

<ApiCard
	name="I2S"
	kind="class"
	purpose="An audio stream with the PWM discipline: the verbs own their setup. The first write()
		configures and starts the TX direction, the first read() the RX — a write-only program (a
		tone to an amplifier) never touches the RX engine at all."
	imports={"import { I2S } from '@typecad/hal'"}>
	{#snippet example()}
		<CodeBlock code={i2sExample} label="audio.ts" />
	{/snippet}
	<DocsTable headers={['Constructor option', 'Type', 'Meaning']} rows={constructorOpts} monoCols={[0, 1]} />
	<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">All methods</h3>
	<DocsTable headers={['Method', 'What it does']} rows={methods} monoCols={[0]} />
	<Callout>
		A stereo frame is two consecutive entries (left, right). Short writes are zero-padded to a
		full block — the wire never sees a partial frame.
	</Callout>
</ApiCard>

<ApiCard
	name="the one-jumper bench test"
	kind="pattern"
	purpose="The hardware loopback: bridge the board's data-out pad to its data-in pad and the write
		path reads back through the read path — no codec, no amplifier. The suite runs exactly this
		on real silicon: a tone block written, DMA-clocked out and back, and asserted sample by
		sample."
	imports={"new I2S(0, { hz: 16000, channels: 2, blockFrames: 16 })"}>
	{#snippet example()}
		<CodeBlock code={loopback} label="loopback.ts" />
	{/snippet}
	<p class="text-sm leading-relaxed">
		On the esp32s3_devkitC (<code>i2s0_default</code>), the jumper is O_SD (GPIO38) to I_SD
		(GPIO41). The settle sleep is honest: the DMA needs time to clock the block out and back
		through the wire.
	</p>
</ApiCard>

<Callout label="Board-gated, like all hardware">
	<code>I2S</code> exists only on boards whose devicetree declares a controller — importing it
	elsewhere fails at module resolution. See
	<a href="/hal/docs/boards" class="font-bold text-primary underline">Boards &amp; Targets</a>.
	Using it emits <code>CONFIG_I2S</code> automatically.
</Callout>
