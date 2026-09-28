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
import { RD_BQ24210 } from '@typecad/rd-bq24210';

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

// one import drops in the whole charger: IC, passives, tracks
let charger = new RD_BQ24210({
  pcb: typecad,
  x: 40,
  y: 30,        // where the module lands; every part inside offsets from it
});

// wire to the module's pins like any other component
typecad.named('VBUS').net(panel.power, charger.VBUS);
typecad.named('GND').net(panel.gnd, charger.VSS, battery.gnd);
typecad.named('BAT').net(battery.power, charger.BAT);

typecad.create(j1, j2, ...charger.components);`;

const packagesPackageJson = `{
  "name": "solar-charger",
  "type": "module",
  "scripts": {
    "build": "typecad-pcb build"
  },
  "dependencies": {
    "@typecad/pcb": "latest",
    "@typecad/rd-bq24210": "latest"
  }
}`;

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

const coinCellIndexTs = `import { PCB, Component, LED, Power, Resistor, runERC } from '@typecad/pcb';

let typecad = new PCB('coin_cell_led');

// CR2450 holder — pin 1 positive, pin 2 ground
let bt1 = new Component({ footprint: 'Battery:BatteryHolder_Keystone_3008_1x2450' });
let coin_cell = new Power({
  power: bt1.pin(1),
  gnd: bt1.pin(2),
  voltage: 3,
  current: 0.5,
});

let r1 = new Resistor({ value: '100ohm', size: '0805' });
let d1 = new LED({ value: 'green', size: '0805' });

// cell → resistor → LED → ground: one loop
typecad.net(coin_cell.power, r1.pin(1));
typecad.net(r1.pin(2), d1.pin(1));
typecad.net(d1.pin(2), coin_cell.gnd);

typecad.outline(0, 0, 25, 25);
bt1.pcb = { ...typecad.board.centered() };
r1.pcb = {
  x: typecad.board.sameAs(bt1).x.plus(5),
  y: typecad.board.below(bt1).by(2),
};
d1.pcb = {
  x: typecad.board.sameAs(r1).x.plus(5),
  y: typecad.board.sameAs(r1).y,
};

typecad.create(bt1, r1, d1);

// electrical rules run against the built schematic
console.log(await runERC('./build/coin_cell_led.kicad_sch'));`;

const i2cMcuTs = `import { Component } from '@typecad/pcb';
/**
 | Pin # | Name       | Type          |
 | --:   | :--        | :--           |
 | 8     | VCC        | power_in      |
 | 4     | GND        | power_in      |
 | 5     | SDA_PB0    | bidirectional |
 | 7     | SCL_PB2    | bidirectional |
 | 1     | _RESET_PB5 | bidirectional |
 */
export class ATtiny85_20S extends Component {
    VCC = this.pin(8, { type: 'power_in' });
    GND = this.pin(4, { type: 'power_in' });
    SDA_PB0 = this.pin(5, { type: 'bidirectional' });
    SCL_PB2 = this.pin(7, { type: 'bidirectional' });
    _RESET_PB5 = this.pin(1, { type: 'bidirectional' });

    constructor(reference?: string | undefined) {
        super("Package_SO:SOIC-8_5.3x5.3mm_P1.27mm");
        this.symbol = "MCU_Microchip_ATtiny:ATtiny85-20S";
        if (reference) this.reference = reference;
    }
}`;

const i2cSensorTs = `import { Component } from '@typecad/pcb';
/**
 | Pin # | Name | Type          |
 | --:   | :--  | :--           |
 | 1     | SDA  | bidirectional |
 | 2     | SCL  | input         |
 | 3     | OS   | output        |
 | 4     | GND  | power_in      |
 | 5     | A2   | input         |
 | 6     | A1   | input         |
 | 7     | A0   | input         |
 | 8     | VS   | power_in      |
 */
export class LM75 extends Component {
    SDA = this.pin(1, { type: 'bidirectional' });
    SCL = this.pin(2, { type: 'input' });
    OS = this.pin(3, { type: 'output' });
    GND = this.pin(4, { type: 'power_in' });
    A2 = this.pin(5, { type: 'input' });
    A1 = this.pin(6, { type: 'input' });
    A0 = this.pin(7, { type: 'input' });
    VS = this.pin(8, { type: 'power_in' });

    constructor(reference?: string | undefined) {
        super("Package_SO:SOIC-8_3.9x4.9mm_P1.27mm");
        this.symbol = "Sensor_Temperature:LM75";
        if (reference) this.reference = reference;
    }
}`;

const i2cIndexTs = `import { PCB, Resistor } from '@typecad/pcb';
import { ATtiny85_20S } from './ATtiny85_20S';
import { LM75 } from './LM75';

let typecad = new PCB('i2c_temp');

let mcu = new ATtiny85_20S('U1');
let sensor = new LM75('U2');

// one pull-up per bus line, to VCC
let sda_pull = new Resistor({ value: '4.7kohm', size: '0603' });
let scl_pull = new Resistor({ value: '4.7kohm', size: '0603' });

typecad.named('VCC').net(mcu.VCC, sensor.VS, sda_pull.pin(1), scl_pull.pin(1));
typecad.named('GND').net(mcu.GND, sensor.GND, sensor.A0, sensor.A1, sensor.A2);

// the USI pins double as the I2C bus — named nets keep the ratsnest readable
typecad.named('SDA').net(mcu.SDA_PB0, sensor.SDA, sda_pull.pin(2));
typecad.named('SCL').net(mcu.SCL_PB2, sensor.SCL, scl_pull.pin(2));

typecad.outline(0, 0, 20, 15);
mcu.pcb = { ...typecad.board.centered(), x: typecad.board.fromLeft(6) };
sensor.pcb = { ...typecad.board.centered(), x: typecad.board.fromRight(6) };
sda_pull.pcb = { x: typecad.board.center.x, y: typecad.board.fromTop(3) };
scl_pull.pcb = { x: typecad.board.center.x, y: typecad.board.fromBottom(3) };

typecad.create(mcu, sensor, sda_pull, scl_pull);`;

const autoRouteIndexTs = `import { PCB, Connector, LED, Power, Resistor } from '@typecad/pcb';

let typecad = new PCB('autoroute_demo');
typecad.outline(0, 0, 30, 20);

// 5 V in on a two-pin header, centered on the left edge
let j1 = new Connector({
  number: 2,
  pcb: { x: typecad.board.fromLeft(4), y: typecad.board.center.y },
});
let vin = new Power({ power: j1.pin(1), gnd: j1.pin(2), voltage: 5, current: 0.5 });

let r1 = new Resistor({ value: '330ohm', size: '0603' });
let r2 = new Resistor({ value: '10kohm', size: '0603' });
let d1 = new LED({ value: 'red', size: '0603' });

// placement reads like the schematic reads: source → resistor → LED, bleed below
r1.pcb = { x: typecad.board.rightOf(j1).by(4), y: typecad.board.sameAs(j1).y };
d1.pcb = { x: typecad.board.rightOf(r1).by(4), y: typecad.board.sameAs(r1).y };
r2.pcb = { x: typecad.board.sameAs(d1).x, y: typecad.board.below(d1).by(2) };

const v5 = typecad.named('V5').net(vin.power, r1.pin(1));
const led = typecad.named('LED_A').net(r1.pin(2), d1.pin(1), r2.pin(1));
const gnd = typecad.named('GND').net(vin.gnd, d1.pin(2), r2.pin(2));

// the router connects every net — width and clearance come from the board rules
for (const net of [v5, led, gnd]) {
  typecad.route(net);
}

typecad.create(j1, r1, r2, d1);`;

const jlcChargerTs = `// generated by: typecad-pcb add component --c=C16581
// (no KiCAD symbol for this one — the pin table below is the source of truth)
import { Component } from '@typecad/pcb';
/**
 | Pin # | Name  | Type      |
 | --:   | :--   | :--       |
 | 1     | TEMP  | input     |
 | 2     | PROG  | input     |
 | 3     | GND   | power_in  |
 | 4     | VCC   | power_in  |
 | 5     | BAT   | power_out |
 | 6     | STDBY | output    |
 | 7     | CHRG  | output    |
 | 8     | CE    | input     |
 */
export class TP4056 extends Component {
    TEMP = this.pin(1, { type: 'input' });
    PROG = this.pin(2, { type: 'input' });
    GND = this.pin(3, { type: 'power_in' });
    VCC = this.pin(4, { type: 'power_in' });
    BAT = this.pin(5, { type: 'power_out' });
    STDBY = this.pin(6, { type: 'output' });
    CHRG = this.pin(7, { type: 'output' });
    CE = this.pin(8, { type: 'input' });

    constructor(reference?: string | undefined) {
        super("Package_SO:SOP-8_3.9x4.9mm_P1.27mm");
        if (reference) this.reference = reference;
    }
}`;

const jlcIndexTs = `import { PCB, Connector, LED, Power, Resistor } from '@typecad/pcb';
import { TP4056 } from './TP4056';

let typecad = new PCB('lipo_charger');

let j1 = new Connector({ number: 2 });   // 5 V in
let j2 = new Connector({ number: 2 });   // battery

let usb = new Power({ power: j1.pin(1), gnd: j1.pin(2), voltage: 5, current: 0.5 });
let battery = new Power({ power: j2.pin(1), gnd: j2.pin(2), voltage: 3.7, current: 0.8 });

let charger = new TP4056('U1');
let prog = new Resistor({ value: '2kohm', size: '0603' });  // 2 kΩ → 500 mA charge
let charge_led = new LED({ value: 'red', size: '0603' });

typecad.named('V5').net(usb.power, charger.VCC, charger.CE, charge_led.pin(1));
typecad.named('GND').net(usb.gnd, charger.GND, battery.gnd, prog.pin(1));
typecad.named('BAT').net(charger.BAT, battery.power);
typecad.net(charger.PROG, prog.pin(2));

// CHRG is open-drain: the LED lights while the cell charges
typecad.net(charge_led.pin(2), charger.CHRG);

typecad.outline(0, 0, 25, 20);
j1.pcb = { x: typecad.board.fromLeft(4), y: typecad.board.center.y };
charger.pcb = { ...typecad.board.centered() };
j2.pcb = { x: typecad.board.fromRight(4), y: typecad.board.center.y };
prog.pcb = { x: typecad.board.sameAs(charger).x, y: typecad.board.below(charger).by(3) };
charge_led.pcb = { x: typecad.board.sameAs(charger).x, y: typecad.board.above(charger).by(3) };

typecad.create(j1, j2, charger, prog, charge_led);`;

const jlcPackageJson = `{
  "name": "lipo-charger",
  "type": "module",
  "scripts": {
    "build": "typecad-pcb build"
  },
  "dependencies": {
    "@typecad/pcb": "latest"
  }
}`;

const bleTempMainTs = `import { BLE, BlePerm, BleValueType, I2C0, Sensor, SENSOR, CHAN, Time } from '@typecad/hal';

const temp = new Sensor(SENSOR.sensirion_sht3xd, I2C0.device(0x44));
const ble = new BLE('TempSensor');

// GATT 2A6E Temperature — int16, 0.01 °C units per the spec
const centi = () => Math.round(temp.get(CHAN.AMBIENT_TEMP) * 100);

ble.char('2A6E', BleValueType.Int16, BlePerm.Read | BlePerm.Notify)
   .onRead(centi);

ble.start();     // register the database, enable the stack, advertise

while (true) {
  temp.fetch();
  ble.notify(0, centi());      // push to subscribers — index 0 is the first char
  Time.sleep(2000);
}`;

const esp32Config = `import type { TypecadConfig } from '@typecad/hal/config';

const config: TypecadConfig = {
  entry: './src/main.ts',
  framework: '@typecad/framework-zephyr',
  board: 'esp32s3_devkitc',
  output: { outDir: './out' },
};

export default config;`;

const wifiHttpMainTs = `import { Request, Time, UART0, WiFi } from '@typecad/hal';

const wifi = new WiFi('MyNetwork', { psk: 'correct-horse-battery-staple' });

wifi.onUp(() => UART0.writeLine('online at ' + wifi.ip()));
wifi.onDrop(() => UART0.writeLine('link lost — retrying'));
wifi.join();

while (true) {
  if (wifi.linked()) {
    const req = new Request(Request.GET, 'http://192.168.2.184:8080/health');
    if (req.send() && req.ok()) {
      UART0.writeLine('health: ' + req.text());
    }
  }
  Time.sleep(5000);
}`;

const mqttMainTs = `import { I2C0, Mqtt, Sensor, SENSOR, CHAN, Time, UART0, WiFi } from '@typecad/hal';

const wifi = new WiFi('MyNetwork', { psk: 'correct-horse-battery-staple' });
wifi.join();

const sht3x = new Sensor(SENSOR.sensirion_sht3xd, I2C0.device(0x44));

const mqtt = new Mqtt('mqtt://broker.local:1883', { clientId: 'typecad-hal' });
mqtt.onMessage((topic, payload) => {
  // fires for every subscribed publish
  if (topic === 'cmd/report') { UART0.writeLine('asked to report: ' + payload); }
});
mqtt.connect();
mqtt.subscribe('cmd/#');        // wildcard: all sub-topics under cmd/

while (true) {
  sht3x.fetch();
  if (wifi.linked() && mqtt.linked()) {
    mqtt.publish('sensors/temperature', String(sht3x.get(CHAN.AMBIENT_TEMP)));
  }
  Time.sleep(5000);
}`;

const bootCounterMainTs = `import { File, Store, UART0 } from '@typecad/hal';

// Store: typed settings under a namespace — counters, calibration, flags
const settings = new Store('app');
const boots = settings.getInt('boots', 1);    // required default: first boot reads 1
settings.setInt('boots', boots + 1);

// File: one whole text document per path — things a person reads
const log = new File('/boot-log.txt');
log.write('boot #' + boots + '\\n' +
          'storage: settings partition, not the app image');

UART0.writeLine('boot #' + boots + ' — re-flash the app, the number keeps counting');
UART0.writeLine('log says:\\n' + log.read());`;

const readSensorMainTs = `import { I2C0, Sensor, SENSOR, CHAN, Time, UART0 } from '@typecad/hal';

// SHT3X temperature/humidity breakout at I2C address 0x44
const sht3x = new Sensor(SENSOR.sensirion_sht3xd, I2C0.device(0x44));

while (true) {
  sht3x.fetch();                               // take one measurement
  const temp = sht3x.get(CHAN.AMBIENT_TEMP);   // read a channel from it
  const rh = sht3x.get(CHAN.HUMIDITY);         // ...same measurement

  UART0.writeLine(temp + ' C, ' + rh + ' %RH');
  Time.sleep(2000);
}`;

const readSensorTestTs = `import { describe, done } from '@typecad/hal/testing';
import { I2C0, Sensor, SENSOR, CHAN } from '@typecad/hal';

const sht3x = new Sensor(SENSOR.sensirion_sht3xd, I2C0.device(0x44));

describe("Sensor")
  .it("reads a plausible temperature")
  .expect((() => {
    sht3x.fetch();
    const t = sht3x.get(CHAN.AMBIENT_TEMP);
    return t > -40 && t < 85;      // inside the SHT3X operating range
  })).toBe(true)
  .it("reads a plausible humidity")
  .expect((() => {
    const rh = sht3x.get(CHAN.HUMIDITY);
    return rh >= 0 && rh <= 100;
  })).toBe(true);

done();`;

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
	},
	'coin-cell-led': {
		slug: 'coin-cell-led',
		title: 'Coin-cell LED board',
		description:
			'A CR2450 holder, a resistor, and an LED — the Power class, an ERC pass, and a board that lights up when you snap the cell in.',
		board: 'CR2450 · 25 × 25 mm',
		tags: ['Power', 'LED', 'ERC'],
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
							children: [file('my-project/hw/src/index.ts', 'typescript', coinCellIndexTs)]
						}
					]
				},
				file('my-project/package.json', 'json', pcbPackageJson)
			]
		}
	},
	'i2c-temp': {
		slug: 'i2c-temp',
		title: 'I2C sensor breakout',
		description:
			'Generated component files for an ATtiny85 and an LM75, a 4.7 kΩ pull-up on each bus line, and named SDA/SCL nets between them.',
		board: 'ATtiny85 + LM75',
		tags: ['generated parts', 'I2C', 'pull-ups'],
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
								file('my-project/hw/src/index.ts', 'typescript', i2cIndexTs),
								file('my-project/hw/src/ATtiny85_20S.ts', 'typescript', i2cMcuTs),
								file('my-project/hw/src/LM75.ts', 'typescript', i2cSensorTs)
							]
						}
					]
				},
				file('my-project/package.json', 'json', pcbPackageJson)
			]
		}
	},
	'auto-route': {
		slug: 'auto-route',
		title: 'Auto-route the whole netlist',
		description:
			'Place a small board with the placement helpers — rightOf, below, sameAs — then let the router connect every net. No manual tracks.',
		board: '2 layers · 3 nets',
		tags: ['placement helpers', 'route'],
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
							children: [file('my-project/hw/src/index.ts', 'typescript', autoRouteIndexTs)]
						}
					]
				},
				file('my-project/package.json', 'json', pcbPackageJson)
			]
		}
	},
	'jlc-export': {
		slug: 'jlc-export',
		title: 'JLCPCB parts and export',
		description:
			'An EasyEDA C-part (a TP4056 LiPo charger), the build BOM, and the gerber/drill export — everything JLCPCB asks for, from one codebase.',
		board: 'TP4056 · JLC assembly',
		tags: ['EasyEDA C-part', 'gerbers', 'BOM'],
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
								file('my-project/hw/src/index.ts', 'typescript', jlcIndexTs),
								file('my-project/hw/src/TP4056.ts', 'typescript', jlcChargerTs)
							]
						}
					]
				},
				file('my-project/package.json', 'json', jlcPackageJson)
			]
		}
	},
	'ble-temperature': {
		slug: 'ble-temperature',
		title: 'BLE temperature sensor',
		description:
			'Advertise a GATT temperature characteristic fed by an SHT3X — read it from your phone, and get notified every two seconds.',
		board: 'xiao_ble · GATT 2A6E',
		tags: ['BLE', 'Sensor', 'notify'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/src',
					name: 'src',
					children: [file('my-project/src/main.ts', 'typescript', bleTempMainTs)]
				},
				file('my-project/typecad-hal.config.ts', 'typescript', config),
				file('my-project/package.json', 'json', packageJson)
			]
		}
	},
	'wifi-http': {
		slug: 'wifi-http',
		title: 'WiFi connect and HTTP',
		description:
			'Join a network, log the link events, and poll an endpoint every five seconds — Request carries the whole HTTP call.',
		board: 'esp32s3_devkitc · HTTP',
		tags: ['WiFi', 'Request', 'events'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/src',
					name: 'src',
					children: [file('my-project/src/main.ts', 'typescript', wifiHttpMainTs)]
				},
				file('my-project/typecad-hal.config.ts', 'typescript', esp32Config),
				file('my-project/package.json', 'json', packageJson)
			]
		}
	},
	mqtt: {
		slug: 'mqtt',
		title: 'MQTT publish and subscribe',
		description:
			'Report SHT3X readings to a broker and react to commands coming back on a wildcard subscription — the session keeps itself alive.',
		board: 'esp32s3_devkitc · MQTT',
		tags: ['Mqtt', 'Sensor', 'wildcards'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/src',
					name: 'src',
					children: [file('my-project/src/main.ts', 'typescript', mqttMainTs)]
				},
				file('my-project/typecad-hal.config.ts', 'typescript', esp32Config),
				file('my-project/package.json', 'json', packageJson)
			]
		}
	},
	'boot-counter': {
		slug: 'boot-counter',
		title: 'Boot counter that survives re-flashing',
		description:
			'Store and File side by side — a typed counter in settings, a human-readable boot log, and the guarantee that ties them together.',
		board: 'Store + File',
		tags: ['Store', 'File', 'settings'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/src',
					name: 'src',
					children: [file('my-project/src/main.ts', 'typescript', bootCounterMainTs)]
				},
				file('my-project/typecad-hal.config.ts', 'typescript', config),
				file('my-project/package.json', 'json', packageJson)
			]
		}
	},
	'read-sensor': {
		slug: 'read-sensor',
		title: 'Read a sensor',
		description:
			'SHT3X over I2C: pick a part token, attach it to the bus, fetch, and read typed channels — plus a hardware test that checks the readings are sane.',
		board: 'SHT3X · I2C 0x44',
		tags: ['Sensor', 'I2C0', 'testing'],
		tree: {
			type: 'folder',
			path: 'my-project',
			name: 'my-project',
			children: [
				{
					type: 'folder',
					path: 'my-project/src',
					name: 'src',
					children: [file('my-project/src/main.ts', 'typescript', readSensorMainTs)]
				},
				{
					type: 'folder',
					path: 'my-project/test',
					name: 'test',
					children: [file('my-project/test/sensor.test.ts', 'typescript', readSensorTestTs)]
				},
				file('my-project/typecad-hal.config.ts', 'typescript', config),
				file('my-project/package.json', 'json', packageJson)
			]
		}
	}
};

export function getWorkspaceExample(slug: string): WorkspaceExample | undefined {
	return workspaceExamples[slug];
}
