<script lang="ts">
	import ApiCard from '$lib/components/docs/api-card.svelte';
	import Callout from '$lib/components/docs/callout.svelte';
	import CodeBlock from '$lib/components/docs/code-block.svelte';
	import DocsTable from '$lib/components/docs/docs-table.svelte';

	const dropInConfig = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  entry: './src/app.ui',

  display: {
    // The panel's devicetree compatible — any display your Zephyr SDK has a
    // binding for. The build harvests the binding, emits a valid devicetree
    // node, and the in-tree driver owns init, geometry, and pixel format.
    driver: 'ilitek,ili9341',
    width: 320, height: 240,        // effective size after rotation
    cs: 5, dc: 21, rst: 22,         // wiring
    rotation: 90,
  },
};

export default config;`;

	const st7796Config = `display: {
  // 3.5"/4" ST7796S SPI TFT — the rig-verified card. The flags below are
  // panel quirks, not framework options: see the quirk table.
  driver: 'sitronix,st7796s',
  width: 480, height: 320,               // landscape
  nativeWidth: 320, nativeHeight: 480,   // portrait raster
  rotation: 1,
  rgbInverted: true,   // clone panels: RGB565 wire byte order
  csHold: true,        // clone panels: CS must stay low across command+data
  cs: 5, dc: 17, rst: 16,
  touch: {
    library: 'FT6336U',
    sda: 8, scl: 9,
    resetPin: 4,       // this module gates touch power on a GPIO
    calibration: { xMin: 0, xMax: 320, yMin: 0, yMax: 480 },
  },
}`;

	const ili9341Config = `display: {
  driver: 'ilitek,ili9341',     // 2.4"–3.2" modules — no quirks needed
  width: 320, height: 240,
  rotation: 90,
  cs: 5, dc: 21, rst: 22,       // classic ESP32 VSPI wiring
  backlightPin: 23,
}`;

	const st7789Config = `display: {
  driver: 'sitronix,st7789v',   // 1.3"/1.54" 240×240, 2.0"/2.4" 240×320
  width: 240, height: 240,
  cs: 5, dc: 21, rst: 22,
  // Some 240×240 modules need case offsets or content sits in a corner:
  // check the binding's x-offset/y-offset properties for your panel.
}`;

	const smallConfig = `display: {
  driver: 'sitronix,st7735r',   // 1.8" 160×128 — ST7735S modules
  width: 160, height: 128,
  cs: 5, dc: 21, rst: 22,
}

display: {
  driver: 'galaxycore,gc9x01x', // 1.28" round 240×240 — watches, dials
  width: 240, height: 240,
  cs: 5, dc: 21, rst: 22,
}`;

	const oledConfig = `display: {
  driver: 'solomon,ssd1306',    // 0.91"–1.3" mono OLED, I²C
  width: 128, height: 64,
  // address: 0x3c, sda: 8, scl: 9,
  // NOTE: mono panels drive display.* ops today; the UI renderer for mono
  // is on the roadmap.
}`;

	const anatomy = [
		['driver', 'The panel\'s devicetree compatible (vendor,panel). Any display your Zephyr SDK binds is drop-in — no profile, no per-panel framework code'],
		['width / height', 'Effective screen size after rotation — what your UI lays out against'],
		['nativeWidth / nativeHeight', 'The panel\'s physical raster when it differs (e.g. a 320×480 portrait glass mounted landscape)'],
		['rotation', '0–3 (matching the panel family\'s MADCTL-style table). Landscape panels need this or writes land outside the address window'],
		['cs / dc / rst', 'Wiring. Defaults exist for common ESP32 VSPI layouts'],
		['spiPins', '{ sck, mosi } — only when the panel sits off the board\'s default SPI pins'],
		['backlightPin', 'Drive the module\'s BL GPIO high at init, when it has one']
	];

	const quirks = [
		['rgbInverted: true', 'White text reads purple, dark backgrounds green — the panel wants RGB565 pixels byte-swapped on the wire. Common on clone SPI TFTs; becomes the driver-reported 565X format'],
		['csHold: true', 'Colors scramble on large fills while init succeeds — the panel needs CS held low across each command+data burst. Selects the adapter\'s CS-holding mipi-dbi host. The classic clone-ST77xx symptom'],
		['channelSwapRb: true', 'Reds and blues trade places (blue accents read brown, whites read yellow) — swap R/B channels at pack time. Use when rotation\'s color-order bit doesn\'t match the panel\'s wiring']
	];

	const touchRows = [
		['FT6336U (capacitive, I²C)', 'sda/scl, i2cAddress, calibration — driven through Zephyr\'s input subsystem (in-tree driver, polling). If the module gates touch power on a GPIO, set resetPin or the controller never answers'],
		['XPT2046 (resistive, SPI)', 'cs/irq, calibration, minPressure (Z1 threshold, default 400) — shares the display\'s SPI bus as the second chip-select'],
		['calibration', 'Raw controller range → screen space. Capacitive panels use the panel\'s native bounds; resistive panels use measured min/max']
	];

	const wiring = [
		['ESP32 (VSPI)', 'SCK=18 · MOSI=23 · MISO=19 · cs=5 · dc=21 · rst=22'],
		['ESP32-S3 (devkit)', 'SCK=12 · MOSI=11 · cs=5 · dc=17 · rst=16 (override with spiPins when wired otherwise)'],
		['ESP32-C3 / S2', 'Same shape — declare spiPins for whatever GPIOs the panel occupies']
	];

	const howItWorks = [
		['Binding harvest', 'The build reads the panel\'s binding YAML from your Zephyr SDK — required properties, defaults, the include chain. The generated devicetree node is valid for any bound panel by construction'],
		['Driver self-builds', 'Panel drivers default on when their devicetree node exists — no Kconfig symbols to assign'],
		['Zephyr display API', 'The adapter speaks display_write; the in-tree driver owns init sequences, gamma, and pixel formats. Panel knowledge moves upstream instead of into your project'],
		['Curated profiles', 'Named presets (e.g. st7796-zephyr) still exist for hand-tuned panels — display.profile instead of display.driver — including a direct-SPI escape hatch for panels in-tree drivers cannot init']
	];
</script>

<svelte:head>
	<title>Displays — typeCAD/hal docs</title>
	<meta
		name="description"
		content="Any display with a Zephyr binding is drop-in: declare the devicetree compatible, geometry, and wiring — ST7796S, ILI9341, ST7789, ST7735, GC9A01, SSD1306 — with quirk flags for clone panels."
	/>
</svelte:head>

<h1 class="mt-3 text-4xl font-bold tracking-tight">Displays</h1>
<p class="mt-3 leading-relaxed text-muted-foreground">
	Displays are data, not code. Declare the panel's devicetree compatible plus the wiring you
	soldered, and the build does the rest: it harvests the panel's binding from your Zephyr SDK,
	emits a valid devicetree node, and the in-tree driver owns initialization and pixel formats.
	Any display your SDK has a binding for works — no profiles to choose from, no per-panel
	framework code.
</p>

<ApiCard
	name="any panel, one config"
	kind="format"
	purpose="The display block: compatible + geometry + wiring. Panel differences live in the
		devicetree binding, discovered at build time from your SDK."
	imports={"display: { driver: 'ilitek,ili9341', ... }"}>
	{#snippet example()}
		<CodeBlock code={dropInConfig} label="typecad-hal.config.ts" />
		<div class="mt-3"><DocsTable headers={['Field', 'What it means']} rows={anatomy} monoCols={[0]} /></div>
	{/snippet}
	<Callout>
		<code>typecad-hal preview</code> renders against the real layout engine with no board —
		the display config only matters for the on-target build.
	</Callout>
</ApiCard>

<ApiCard
	name="common modules"
	kind="examples"
	purpose="The panels that show up on most ESP32 projects, with the wiring that ships on the
		common breakout boards. The ST7796S card is hardware-verified end to end; the others
		ride the same mechanism against their in-tree drivers."
	imports={"display.driver = <compatible>"}>
	{#snippet example()}
		<h3 class="text-sm font-bold uppercase tracking-widest">ST7796S — 3.5"/4" SPI TFT (480×320)</h3>
		<p class="mt-1 text-sm text-muted-foreground">
			The big landscape workhorse, usually paired with FT6336U capacitive touch. Clone modules
			are common — this card carries both quirk flags plus the touch power-enable GPIO, all
			verified on hardware.
		</p>
		<CodeBlock code={st7796Config} label="typecad-hal.config.ts" class="mt-2" />

		<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">ILI9341 — 2.4"–3.2" SPI TFT (320×240)</h3>
		<p class="mt-1 text-sm text-muted-foreground">
			The most common general-purpose TFT. Clean drop-in — well-behaved panels need no quirks.
		</p>
		<CodeBlock code={ili9341Config} label="typecad-hal.config.ts" class="mt-2" />

		<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">ST7789 — 1.3"–2.4" SPI TFT</h3>
		<p class="mt-1 text-sm text-muted-foreground">
			The small-format favorite (240×240 and 240×320). Some 240×240 glass needs case offsets —
			content in a corner means the panel's binding offsets need values.
		</p>
		<CodeBlock code={st7789Config} label="typecad-hal.config.ts" class="mt-2" />

		<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">ST7735 · GC9A01 — 1.8" and round 1.28"</h3>
		<p class="mt-1 text-sm text-muted-foreground">
			The budget 160×128 workhorse and the round 240×240 for watches and dials — same config
			shape, different compatible.
		</p>
		<CodeBlock code={smallConfig} label="typecad-hal.config.ts" class="mt-2" />

		<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">SSD1306 — mono OLED</h3>
		<p class="mt-1 text-sm text-muted-foreground">
			The I²C 128×64 staple. Mono panels drive direct display.* operations today; the UI
			renderer for monochrome is on the roadmap.
		</p>
		<CodeBlock code={oledConfig} label="typecad-hal.config.ts" class="mt-2" />

		<h3 class="mt-6 text-sm font-bold uppercase tracking-widest">Typical ESP32xx wiring</h3>
		<div class="mt-2"><DocsTable headers={['Board', 'Pins the display usually occupies']} rows={wiring} monoCols={[0, 1]} /></div>
	{/snippet}
</ApiCard>
<ApiCard
	name="panel quirks"
	kind="reference"
	purpose="Three flags cover every misbehaving panel observed in the wild. Each maps a symptom
		to a fix — none of them touch framework code."
	imports={"rgbInverted · csHold · channelSwapRb"}>
	{#snippet example()}
		<DocsTable headers={['Flag', 'Symptom it fixes']} rows={quirks} monoCols={[0]} />
		<Callout>
			These are facts about the panel, not the framework. A verified set — compatible,
			geometry, flags, touch wiring — is a shareable "panel card": copy it between projects
			with the module.
		</Callout>
	{/snippet}
</ApiCard>

<ApiCard
	name="touch"
	kind="reference"
	purpose="Touch combines with any display — the calibration math maps the controller's raw
		coordinates onto whatever geometry the display declares."
	imports={"display.touch = { library, ... }"}>
	{#snippet example()}
		<DocsTable headers={['Controller', 'Config + notes']} rows={touchRows} monoCols={[0]} />
	{/snippet}
</ApiCard>

<ApiCard
	name="how it works"
	kind="reference"
	purpose="Why there are no profiles to maintain: the Zephyr SDK is the catalog."
	imports={"the installed SDK is the source of truth"}>
	{#snippet example()}
		<DocsTable headers={['Piece', 'What happens']} rows={howItWorks} monoCols={[0]} />
	{/snippet}
</ApiCard>
