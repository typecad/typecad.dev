// The image manifest: one entry per docs image. Each snippet in ./snippets is
// kept close to the code shown next to its image on the site.

export interface Step {
	/** Tap the centre of the element with this id. */
	tapId?: string;
	/** Tap at (x, y) in display pixels. */
	tap?: [number, number];
	/** Leave the finger down after the tap (captures :pressed). */
	keepDown?: boolean;
	holdMs?: number;
	/** Drag from (x0, y0) to (x1, y1). */
	drag?: [number, number, number, number];
	/** Simulated ms to run after the step. Default 60. */
	waitMs?: number;
}

export interface Shot {
	name: string;
	file: string;
	width?: number;
	height?: number;
	panels?: string[];
	themeClass?: string;
	scale?: number;
	steps?: Step[];
}

export const PANELS: Record<
	string,
	{ scale: number; display: Record<string, unknown> & { width: number; height: number } }
> = {
	tft: { scale: 2, display: { driver: 'ilitek,ili9341', width: 320, height: 240, colorFormat: 'rgb565' } },
	mono: { scale: 3, display: { driver: 'solomon,ssd1306', width: 128, height: 64, colorFormat: 'mono' } }
};

export const SHOTS: Shot[] = [
	// overview
	{ name: 'counter', file: 'counter.ui', height: 120 },
	{ name: 'counter-tapped', file: 'counter.ui', height: 120, steps: [{ tapId: 'tapBtn', waitMs: 400 }, { tapId: 'tapBtn', waitMs: 400 }, { tapId: 'tapBtn', waitMs: 400 }] },

	// elements
	{ name: 'forms', file: 'forms.ui', height: 420 },
	{ name: 'select-open', file: 'forms.ui', height: 420, steps: [{ tapId: 'mode', waitMs: 120 }] },
	{ name: 'keyboard', file: 'keyboard.ui', steps: [{ tapId: 'ssid', waitMs: 120 }] },
	{ name: 'richtext', file: 'richtext.ui', height: 170 },
	{ name: 'navigation', file: 'navigation.ui', height: 200 },
	{ name: 'list', file: 'list.ui', height: 200 },
	{ name: 'images', file: 'images.ui', height: 170 },
	{ name: 'canvas', file: 'canvas.ui', height: 90 },
	{ name: 'drawer', file: 'overlays.ui', steps: [{ tapId: 'openBtn', waitMs: 600 }] },
	{ name: 'dialog', file: 'overlays.ui', steps: [{ tapId: 'askBtn', waitMs: 300 }] },
	{ name: 'toast', file: 'overlays.ui', steps: [{ tapId: 'saveBtn', waitMs: 400 }] },
	{ name: 'table', file: 'table.ui', height: 150 },

	// styling
	{ name: 'layout', file: 'layout.ui', height: 150 },
	{ name: 'boxes', file: 'boxes.ui', height: 135 },
	{ name: 'text', file: 'text.ui', height: 290 },
	{ name: 'pressed', file: 'pressed.ui', height: 100, steps: [{ tapId: 'held', keepDown: true, waitMs: 300 }] },
	{ name: 'kit', file: 'kit.ui', height: 230 },
	{ name: 'theme', file: 'theme.ui', height: 160 },
	{ name: 'theme-dark', file: 'theme.ui', height: 160, themeClass: 'dark' },
	{ name: 'panel', file: 'panel.ui', panels: ['tft', 'mono'], width: 128, height: 64, scale: 3 }
];
