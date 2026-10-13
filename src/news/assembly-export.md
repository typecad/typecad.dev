---
title: "Assembly export: the CPL, the BOM, and the zip"
description: "typecad-pcb export pos, bom, and assembly write centroid files and bills of materials for JLCPCB, PCBWay, Seeed, and OpenPnP — and one command builds the whole upload package."
date: 2026-10-11
published: true
---

Ordering assembly used to be the part of the flow where you leave the terminal: open a PCB editor, hunt through its export dialogs, rename some columns by hand, and hope the shop's preview agrees with your file. Now it's this:

```bash
typecad-pcb export assembly --profile jlcpcb
```

That stages gerbers, drill, job file, the centroid file, and the BOM in `build/assembly/<board>-jlcpcb/`, and zips them into `<board>-jlcpcb.zip` — the one file the uploader wants. Our own writer, no KiCAD install involved, same as the gerber export.

The three pieces also work alone:

```bash
typecad-pcb export pos --profile jlcpcb   # the CPL (centroid / pick & place)
typecad-pcb export bom --profile jlcpcb   # the BOM, refs grouped per part
```

## A profile per shop

Every assembler wants the same information and none of them spell it the same way, so a provider is a profile, not a code path:

- `jlcpcb` — `Designator, Mid X, Mid Y, Layer, Rotation`, T/B sides, mm. The two CSVs their BOM/CPL slots expect.
- `pcbway` and `seeed` — the same CPL family with their own conventions spelled out.
- `openpnp` — a native `.board.xml` you open straight from the Boards tab, plus the `id,x,y,rotation,side` CSV its importer reads, for when the pick &amp; place machine is yours.
- `kicad` — kicad-cli's own pos-CSV semantics, for anything that already speaks KiCAD.
- `generic` — every column and unit exposed, for the shop we've never heard of.

We wrote each one against the provider's own docs, not folklore. One thing we deliberately did *not* do: adjust bottom-side rotations behind your back for the *shops*. Shops handle KiCAD-frame data on their side (PCBWay asks you not to pre-mirror it), but the 0°-vs-180° convention for mirrored parts is genuinely ambiguous per assembler. The file says what the board says; if the shop's preview shows a bottom part spun wrong, `--bottom-rotation 180` is the switch. Check it on one part before trusting the whole file.

OpenPnP is the exception, because there's no assembler on the other end to adapt anything — so its files get the transform OpenPnP's own KiCad importer applies to bottom-side parts (x negated, rotation mirrored through 180°). We took it from their source, not the forum folklore that surrounds this exact topic.

## The machine can be yours

`export pos --profile openpnp` (and the assembly package) writes a native `<board>.board.xml` beside the CSV. In OpenPnP you don't create an empty board and import into it — you open this file from the Boards tab and the placements are already there, each named with the part OpenPnP expects (footprint + value, the same naming its KiCad importer uses). The board size comes along when your Edge.Cuts outline exists. Parts it doesn't know load unassigned; you map them to feeders in the Jobs tab like always.

And re-running the export doesn't undo that mapping. Part associations and placement settings live in the board file, so a naive re-export would torch the twenty minutes you spent wiring placements to your parts library. Instead the geometry follows the board — new positions, new parts added, gone parts dropped (and named in the log) — while everything you set inside OpenPnP rides over unchanged: part assignments, Ignore flags, comments. `--fresh-board` throws it away on purpose when you want to start clean. Your feeders were never in this file; they live in OpenPnP's machine configuration and no export can touch them.

The board file also carries what the machine needs to actually run, not just what to place: `FID*` references ship as fiducial placements (OpenPnP aligns on them; we used to throw them away), a closing Edge.Cuts outline rides along as the board profile, and every pad on a paste layer lands in `solderPastePads` for dispensing setups. Beside it, `packages.xml` and `parts.xml` define the board's packages — pad layout and body size, the geometry bottom vision checks each placed part against — with part names matching the board's part-ids exactly. OpenPnP won't import those from a menu; they're for its configuration directory or its Parts tab, and part heights are yours to fill in.

## "Center of the component" has three answers

A centroid row needs a point, and "the middle of the part" isn't one until you pick a frame:

- **anchor** — the footprint's origin, what KiCAD's exporter reports
- **body** — the center of the fabrication outline, rotated into place
- **pads** — the average of the pad centers

Shop profiles default to `body`, and the difference isn't academic. Our test board has a 1N4007 laid horizontal — a DO-41, pads 7.62 mm apart. Its anchor sits on pad 1; its body center is 3.81 mm away, half the pitch, exactly where the body actually is. A machine placing at the anchor drops the part in the gap between the pads. `--centroid` switches if your shop disagrees.

## The BOM reads your code

`mpn` on a component lands in JLC's `LCSC Part #` column, refs collapse per unique value + footprint + part number (`--ungrouped` for one row per ref), and parts with `dnp: true` stay out. If there's no netlist beside the board — or it's stale — the BOM degrades to board-only columns instead of failing; the part numbers just stay empty.

```ts
let r1 = new Component({
  reference: 'R1',
  footprint: 'Resistor_SMD:R_0603_3191Metric',
  value: '100k',
  mpn: 'C25803',
});
```

## What it isn't

- No STEP model, no IPC-2581 electrical netlist. Fab + assembly files only, for now.
- The zip is store-only (uncompressed). Fab packages are a few hundred KB of text — you weren't going to notice.
- THT parts like that DO-41 land in the CPL even though most shops won't machine-place them. `--exclude` takes ref patterns if you'd rather they didn't.

Docs are at [typecad.dev/pcb/docs/assembly-export](https://typecad.dev/pcb/docs/assembly-export). If a shop's importer chokes on a file we generate, that's a bug we want: open an issue on [github.com/typecad](https://github.com/typecad) with the provider and the error. Bonus points for the part it misplaced.
