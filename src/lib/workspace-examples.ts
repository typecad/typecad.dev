import { createHighlighter } from 'shiki';

/**
 * VSCode-workspace examples (cuttlefish-style): a file tree the visitor can
 * click through, rendered as a simulated editor. Sources are hand-authored
 * here and Shiki-highlighted once at build time.
 */

export interface WorkspaceFile {
	type: 'file';
	path: string;
	name: string;
	lang: string;
	content: string;
	html: string;
}

export interface WorkspaceFolder {
	type: 'folder';
	path: string;
	name: string;
	children: WorkspaceNode[];
}

export type WorkspaceNode = WorkspaceFile | WorkspaceFolder;

export interface WorkspaceExample {
	slug: string;
	title: string;
	description: string;
	board: string;
	tags: string[];
	tree: WorkspaceFolder;
}

const highlighter = await createHighlighter({
	themes: ['dark-plus'],
	langs: ['typescript', 'json']
});

function file(path: string, lang: string, content: string): WorkspaceFile {
	return {
		type: 'file',
		path,
		name: path.split('/').pop() ?? path,
		lang,
		content,
		html: highlighter.codeToHtml(content.trim(), { lang, theme: 'dark-plus' })
	};
}

const mainTs = `import { GPIO, LED, Time } from '@typecad/hal';

const led = new GPIO(LED, GPIO.OUTPUT);

while (true) {
  led.set(true);      // LED on — polarity is handled for you
  Time.sleep(500);    // half a second
  led.set(false);     // LED off
  Time.sleep(500);
}`;

const blinkTest = `import { describe, done } from '@typecad/hal/testing';
import { GPIO, LED, Time } from '@typecad/hal';

describe("Blink")
  .it("turns the LED on")
  .expect((() => {
    const led = new GPIO(LED, GPIO.OUTPUT);
    led.set(true);
    return led.get();
  })).toBe(true)
  .it("turns the LED off")
  .expect((() => {
    const led = new GPIO(LED, GPIO.OUTPUT);
    led.set(false);
    return led.get();
  })).toBe(false);

done();`;

const config = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  entry: './src/main.ts',
  framework: '@typecad/framework-zephyr',
  board: 'xiao_ble/nrf52840',
  output: { outDir: './out' },
  // Upload port for build --upload. Precedence: --port flag >
  // TYPECAD_HAL_PORT env var > this file.
};

export default config;`;

const packageJson = `{
  "name": "my-project",
  "type": "module",
  "scripts": {
    "build": "typecad-hal build",
    "test:hw": "typecad-hal test"
  },
  "dependencies": {
    "@typecad/hal": "latest",
    "@typecad/framework-zephyr": "latest"
  }
}`;

const pcbIndexTs = `import { PCB, Resistor } from '@typecad/pcb';

let typecad = new PCB('first_board', { thickness: 1.6, copper_thickness: 35 });

let r1 = new Resistor({ value: '10kohm', size: '0805' });
let r2 = new Resistor({ value: '10kohm', size: '0805' });

// vin — r1 — vout — r2 — gnd: half of vin shows up on vout
typecad.named('vin').net(r1.pin(1));
const vout = typecad.named('vout').net(r1.pin(2), r2.pin(1));
typecad.named('gnd').net(r2.pin(2));

// a 15 × 10 mm outline, resistors spaced along the centerline
typecad.outline(0, 0, 15, 10);
r1.pcb = { x: 5, y: 5 };
r2.pcb = { x: 10, y: 5 };

// let the router connect vout
typecad.route(vout);

// emit .kicad_pcb, .kicad_sch, .net, and the BOM into ./build/
typecad.create(r1, r2);`;

const pcbPackageJson = `{
  "name": "my-project",
  "type": "module",
  "scripts": {
    "build": "typecad-pcb build"
  },
  "dependencies": {
    "@typecad/pcb": "latest"
  }
}`;

const multilayerIndexTs = `import { PCB, Resistor } from '@typecad/pcb';

// four copper layers; stackup() refines the JLCPCB-standard defaults
let pcb = new PCB('four_layer', { layers: 4 });

pcb.stackup(4, {
  copper_finish: 'ENIG',
  dielectric_constraints: true,          // required for impedance targets
  layers: {
    'dielectric 1': { thickness: 0.21 }, // prepreg under F.Cu
  },
});

// inner copper is reserved: board-covering planes, invisible to the router
pcb.plane('GND', 'In1.Cu');
pcb.plane('3V3', 'In2.Cu');

pcb.outline(0, 0, 40, 25);

let r1 = new Resistor({ value: '10kohm', size: '0603' });
let r2 = new Resistor({ value: '10kohm', size: '0603' });
r1.pcb = { x: 15, y: 12.5 };
r2.pcb = { x: 25, y: 12.5 };

// outer layers carry the signals; route to the impedance the stackup can hit
const signal = pcb.named('signal').net(r1.pin(2), r2.pin(1));
pcb.route(signal, { width: pcb.impedanceWidth('F.Cu', 50, 5) });

// reinforcement on every router-placed via, plus a via fence on the edge
pcb.teardrops();
pcb.stitch('GND', { pitch: 2, margin: 1 });

pcb.create(r1, r2);`;

const multilayerPackageJson = `{
  "name": "my-project",
  "type": "module",
  "scripts": {
    "build": "typecad-pcb build"
  },
  "dependencies": {
    "@typecad/pcb": "latest"
  }
}`;

const packagesIndexTs = `import { PCB, Connector, Power } from '@typecad/pcb';
import { rd_bq24210 } from '@typecad/rd-bq24210';

let typecad = new PCB('solar_charger');

// panel and battery arrive on connectors
let j1 = new Connector({ number: 2, pcb: { x: 10, y: 15 } });
let j2 = new Connector({ number: 2, pcb: { x: 10, y: 45 } });

let panel = new Power({
  power: j1.pin(1),
  gnd: j1.pin(2),
  voltage: 6,
  current: 0.5,
});
let battery = new Power({
  power: j2.pin(1),
  gnd: j2.pin(2),
  voltage: 3.7,
  current: 0.8,
});

// one call drops in the whole charger: IC, passives, tracks
let charger = new rd_bq24210({
  chargeCurrentMa: 500,
  temperatureMonitoring: true,
  pcb: typecad,
});

typecad.net(panel.power, charger.U1.VBUS);
typecad.net(panel.gnd, charger.U1.VSS);
typecad.net(battery.power, charger.U1.BAT);
typecad.net(battery.gnd, charger.U1.VSS);

typecad.create(j1, j2, ...charger.components);`;

const packagesPackageJson = `{
  "name": "solar-charger",
  "type": "module",
  "scripts": {
    "build": "typecad-pcb build"
  },
  "dependencies": {
    "@typecad/pcb": "latest",
    "@typecad/rd-bq24210": "^0.0.9"
  }
}`;

const jigIndexTs = `import { PCB, Component, MountingHole, Resistor, TestPoint } from '@typecad/pcb';

// the board under test: a resistor bridging two test points
let dut = new PCB('dut');
dut.outline(0, 0, 70, 40);

let r1 = new Resistor({ value: '1kohm', size: '0603', pcb: { x: 35, y: 20 } });
let tp1 = new TestPoint({ pcb: { x: 25, y: 20 } });
let tp2 = new TestPoint({ pcb: { x: 45, y: 20 } });
let mh1 = new MountingHole({ size: 'M2.5', pcb: { x: 5, y: 5 } });
let mh2 = new MountingHole({ size: 'M2.5', pcb: { x: 65, y: 35 } });

dut.net(tp1.pin(1), r1.pin(1));
dut.net(r1.pin(2), tp2.pin(1));
dut.create(r1, tp1, tp2, mh1, mh2);

// the jig: pogo pins on the same coordinates, mounting holes aligned
let jig = new PCB('jig');
jig.outline(0, 0, 70, 40);

// pogo pin — generate a real part: typecad-pcb add component --c=<JLCPN>
let pogo1 = new Component({
  footprint: 'Connector_PinSocket_2.54mm:PinSocket_1x01_P2.54mm_Vertical',
  value: 'pogo pin',
  pcb: { x: 25, y: 20 },
});
let pogo2 = new Component({
  footprint: 'Connector_PinSocket_2.54mm:PinSocket_1x01_P2.54mm_Vertical',
  value: 'pogo pin',
  pcb: { x: 45, y: 20 },
});
let jmh1 = new MountingHole({ size: 'M2.5', pcb: { x: 5, y: 5 } });
let jmh2 = new MountingHole({ size: 'M2.5', pcb: { x: 65, y: 35 } });

jig.create(pogo1, pogo2, jmh1, jmh2);`;

const importIndexTs = `// generated by: typecad-pcb import ./existing-board.kicad_pcb
import { PCB, Component } from '@typecad/pcb';

let typecad = new PCB('existing_board');

typecad.outline(0, 0, 50, 40);

let u1 = new Component({
  footprint: 'Package_SO:SOIC-8_5.3x5.3mm_P1.27mm',
  reference: 'U1',
  pcb: { x: 25, y: 20, rotation: 0 },
});

// tracks arrive as TrackBuilder chains
let track1 = typecad
  .track()
  .from({ x: 25, y: 20 }, 'F.Cu', 0.25)
  .to({ x: 35, y: 20 });

typecad.zone({
  net: 'GND',
  layers: ['B.Cu'],
  bounds: typecad.board,
});

typecad.create(u1, track1);`;

const importPackageJson = `{
  "name": "imported-board",
  "type": "module",
  "scripts": {
    "build": "typecad-pcb build"
  },
  "dependencies": {
    "@typecad/pcb": "latest"
  }
}`;

export const workspaceExamples: Record<string, WorkspaceExample> = {
	blink: {
		slug: 'blink',
		title: 'Blink — your first firmware',
		description:
			'The smallest complete hal project: create it, toggle the onboard LED, and test it on real hardware — the whole flow end to end.',
		board: 'xiao_ble/nrf52840',
		tags: ['GPIO', 'Time', 'testing'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/src',
					name: 'src',
					children: [
						file('my-project/src/main.ts', 'typescript', mainTs)
					]
				},
				{
					type: 'folder',
					path: 'my-project/test',
					name: 'test',
					children: [
						file('my-project/test/blink.test.ts', 'typescript', blinkTest)
					]
				},
				file('my-project/typecad-hal.config.ts', 'typescript', config),
				file('my-project/package.json', 'json', packageJson)
			]
		}
	},
	'first-board': {
		slug: 'first-board',
		title: 'Your first board',
		description:
			'The smallest complete pcb project: two resistors, three named nets, and one build that produces a KiCAD board — the whole flow end to end.',
		board: 'KiCAD 10 · ./build/',
		tags: ['passives', 'nets', 'placement', 'routing'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/hw',
					name: 'hw',
					children: [
						{
							type: 'folder',
							path: 'my-project/hw/src',
							name: 'src',
							children: [
								file('my-project/hw/src/index.ts', 'typescript', pcbIndexTs)
							]
						}
					]
				},
				file('my-project/package.json', 'json', pcbPackageJson)
			]
		}
	},
	'multilayer-board': {
		slug: 'multilayer-board',
		title: 'A four-layer board',
		description:
			'Stackup, inner-layer planes, controlled-impedance routing, stitching, and teardrops — the works, on a 40 × 25 mm board.',
		board: '4 layers · ENIG',
		tags: ['stackup', 'planes', 'impedance', 'stitching'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/hw',
					name: 'hw',
					children: [
						{
							type: 'folder',
							path: 'my-project/hw/src',
							name: 'src',
							children: [
								file('my-project/hw/src/index.ts', 'typescript', multilayerIndexTs)
							]
						}
					]
				},
				file('my-project/package.json', 'json', multilayerPackageJson)
			]
		}
	},
	packages: {
		slug: 'packages',
		title: 'Use a package — solar charger',
		description:
			'npm install a complete charger circuit, wire the panel and battery to its pins, and create it like any other component.',
		board: '@typecad/rd-bq24210',
		tags: ['npm', 'Power', 'Connector'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/hw',
					name: 'hw',
					children: [
						{
							type: 'folder',
							path: 'my-project/hw/src',
							name: 'src',
							children: [
								file('my-project/hw/src/index.ts', 'typescript', packagesIndexTs)
							]
						}
					]
				},
				file('my-project/package.json', 'json', packagesPackageJson)
			]
		}
	},
	jig: {
		slug: 'jig',
		title: 'Test jig — two boards, one codebase',
		description:
			'The board under test and its pogo-pin jig from the same project: shared mounting-hole coordinates, one build, two KiCAD outputs.',
		board: '2 × PCB outputs',
		tags: ['TestPoint', 'MountingHole', 'outline'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/hw',
					name: 'hw',
					children: [
						{
							type: 'folder',
							path: 'my-project/hw/src',
							name: 'src',
							children: [file('my-project/hw/src/index.ts', 'typescript', jigIndexTs)]
						}
					]
				},
				file('my-project/package.json', 'json', pcbPackageJson)
			]
		}
	},
	'import-kicad': {
		slug: 'import-kicad',
		title: 'Imported from KiCAD',
		description:
			'What a board looks like after typecad-pcb import: placements, tracks, outline, and a zone — source you can build on instead of a file you only edit.',
		board: 'from .kicad_pcb',
		tags: ['import', 'TrackBuilder', 'zone'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/hw',
					name: 'hw',
					children: [
						{
							type: 'folder',
							path: 'my-project/hw/src',
							name: 'src',
							children: [
								file('my-project/hw/src/index.ts', 'typescript', importIndexTs)
							]
						}
					]
				},
				file('my-project/package.json', 'json', importPackageJson)
			]
		}
	}
};

export function getWorkspaceExample(slug: string): WorkspaceExample | undefined {
	return workspaceExamples[slug];
}
