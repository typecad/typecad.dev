---
title: "Board artwork: put a PNG on the copper"
description: "A new Image class places PNGs and SVGs as exposed copper, silkscreen, and mask openings — traced to contours, editable in the layout view, and shippable inside packages."
date: 2026-10-05
published: true
---

Boards with a logo on them look like products. Boards without one look like evaluations. We got tired of that gap being a trip to a PCB editor and an image converter, so `@typecad/pcb` now has an `Image` class:

```ts
import { PCB, Image } from '@typecad/pcb';

let pcb = new PCB('badge');

let art = new Image({
  file: 'logo.png',        // PNG or SVG
  at: [50, 30],            // artwork center, mm
  size: 40,                // mm width; height follows the aspect
});

pcb.create(art);
```

That's the whole API. The interesting part is what "color" means on a board.

## Three inks

A fabbed board doesn't have colors — it has exposed copper, silkscreen, and solder-mask openings, sitting on whatever mask color you ordered. So the image format isn't grayscale or RGB; it's a palette with exactly three inks, and the mask color is the background you pick at the fab, not something you paint:

- red pixels become copper on `F.Cu`, with a mask opening beside them (copper under intact mask is invisible — you'd be ordering art you can't see)
- white pixels become silkscreen
- blue pixels become mask openings — bare substrate, or gold where copper sits underneath

Your logo is probably not red, white, and blue. Ours isn't either — the favicon on one of our boards is teal on transparency, so it gets one extra line:

```ts
let art = new Image({
  file: './assets/favicon.png',
  at: [142.5, 85.5],
  size: [12, 12],
  inks: { copper: '#02B388' },   // the logo's actual color
});
```

Transparent pixels are background. Export with flat colors and antialiasing off when you can; `tolerance` decides how much of the fringe still counts.

## Traced, not tiled

The obvious implementation tiles the image into thousands of little rectangles, and the board file pays for it. We trace each ink's boundary into contour rings instead, with holes bridged in as hairline slits — the same trick KiCAD's own image converter uses, because a `gr_poly` is a single ring and a donut needs its hole somehow. A 20 mm logo lands as roughly 150 points of gerber. Letter counters and logo counters come out as actual holes.

`mode: 'rects'` gives you the merged-rectangle version if you want the exact raster grid, and `smooth` straightens staircase edges from pixel snapping.

## SVG, vector end to end

`file: 'logo.svg'` skips the raster entirely: paths flatten to polygons at your placed size, subpaths nest (a donut is one path), and a shape with no `fill` anywhere on its chain is the artwork itself. We read the plain-attribute shapes logo SVGs actually use — `path`, `rect`, `circle`, `polygon`, transforms. We don't read strokes, text, `use` references, or CSS `<style>` blocks. If that kills your file, flatten it first; Inkscape and Figma exports work as-is.

## Gold logos render as gold

The PCBA render got more honest in the same pass: exposed copper artwork used to fall through to the substrate color at mask openings (only pad flashes got the finish treatment), so gold logos rendered as bare board. Board-level copper now paints in the finish color at the openings, matching the pads.

## In the layout view, it's an object

The VS Code layout view gained a **place image** button: pick a PNG, click the board to drop its center, and apply writes the `new Image({ ... })` statement into your source. After the rebuild the artwork is still an object — dashed outline, file label — so you can click it, drag it with `M`, resize or flip it with `E`, replace the file with a fresh pick, or `Del` it. All of that rides the same apply as moving a part: the statement in source is what changes.

It also ships inside packages. Assign an `Image` in `build()` with package-local coordinates and the package offset moves it along with the parts.

## What it isn't

- Copper artwork is non-net copper. Keep it clear of real nets yourself — the design rule check will flag collisions, which is it working.
- Dense silkscreen art trips `silk_overlap` warnings against its own polygons. Art-heavy boards usually set `silk_overlap: ignore` in the conf severities.
- PNG art is raster: at the default 0.1 mm cells, a diagonal edge is a staircase that `smooth` approximates. SVG doesn't have this problem.
- No JPEG. PNG and SVG.

If a logo comes out wrong, or an SVG feature you need isn't read, open an issue on [github.com/typecad](https://github.com/typecad). Bonus points for attaching the file that broke it.
