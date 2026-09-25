/** Single source of truth for the /pcb/docs section: sidebar categories, hub grid, pager order */

export interface PcbDocArea {
	slug: string;
	title: string;
	blurb: string;
}

export interface PcbDocGroup {
	title: string;
	areas: PcbDocArea[];
}

export const PCB_DOC_GROUPS: PcbDocGroup[] = [
	{
		title: 'Start here',
		areas: [
			{
				slug: 'getting-started',
				title: 'Getting started',
				blurb: 'Requirements, creating a project, the CLI, and VSCode'
			},
			{
				slug: 'vscode',
				title: 'The VS Code extension',
				blurb: 'Bundled board viewer, pin hovers, and two-way cross-probing — no marketplace install'
			}
		]
	},
	{
		title: 'Core language',
		areas: [
			{
				slug: 'pcb',
				title: 'The PCB class',
				blurb: 'Board creation, create(), nets, routing entry point'
			},
			{
				slug: 'components',
				title: 'Components',
				blurb: 'The Component class, the add-component tool, generated files'
			},
			{
				slug: 'passives',
				title: 'Passives',
				blurb: 'Built-in resistors, capacitors, LEDs — sized with the size option'
			},
			{
				slug: 'connections',
				title: 'Connections',
				blurb: 'net() and named() — wiring pins together'
			},
			{
				slug: 'pins-power',
				title: 'Pins & Power',
				blurb: 'Pin access, power-aware checks, the Power class'
			},
			{
				slug: 'buses',
				title: 'Buses',
				blurb: 'I2C, UART, USB pin pairings'
			}
		]
	},
	{
		title: 'Board & layout',
		areas: [
			{
				slug: 'placement',
				title: 'Placement',
				blurb: 'Coordinates, board bounds, relative placement'
			},
			{
				slug: 'routing',
				title: 'Routing',
				blurb: 'The auto router and manual tracks'
			},
			{
				slug: 'board-layout',
				title: 'Board Layout',
				blurb: 'Outlines, zones, design rules, graphics, vias'
			}
		]
	},
	{
		title: 'Checks & output',
		areas: [
			{
				slug: 'checks-export',
				title: 'Checks & Export',
				blurb: 'ERC, DRC, export functions, kicad-cli'
			},
			{
				slug: 'simulation',
				title: 'Simulation',
				blurb: 'SPICE the schematic with ngspice — op() and tran() from the same code as the board'
			},
			{
				slug: 'import',
				title: 'Import from KiCAD',
				blurb: 'Convert a .kicad_pcb to typeCAD, apply KiCAD edits back'
			},
			{
				slug: 'diff',
				title: 'Git diff',
				blurb: 'Visual board, netlist, and BOM comparisons'
			},
			{
				slug: 'docgen',
				title: 'DocGen',
				blurb: 'Markdown + a board file → HTML docs with renders'
			}
		]
	},
	{
		title: 'Packages',
		areas: [
			{
				slug: 'packages',
				title: 'Packages',
				blurb: 'Install circuit modules with npm'
			},
			{
				slug: 'package-authoring',
				title: 'Package authoring',
				blurb: 'Build and publish reusable circuit modules'
			}
		]
	},
	{
		title: 'Reference',
		areas: [
			{
				slug: 'cli',
				title: 'The CLI',
				blurb: 'Every typecad-pcb command and its flags'
			},
			{
				slug: 'troubleshooting',
				title: 'Troubleshooting',
				blurb: 'Common errors and their fixes'
			}
		]
	}
];

/** Flat reading order — drives the hub grid and the prev/next pager */
export const PCB_DOC_AREAS: PcbDocArea[] = PCB_DOC_GROUPS.flatMap((g) => g.areas);
