---
title: "You can build a board without installing KiCad"
description: "typeCAD/pcb now gets the KiCad symbols and footprints your board uses from GitLab and keeps a copy for the next build."
date: 2026-11-18
published: true
---

We used to ask you to install KiCad before building your first board with typeCAD/pcb. If you've got Node.js and npm, you can skip that step.

## Checks and Gerbers are built in

We run electrical rule checks (ERC) and design rule checks (DRC) in typeCAD/pcb. We generate Gerbers and drill files directly, too. You can go from TypeScript to fabrication files without installing KiCad.

If you've got KiCad installed, add `--kicad` to use its checker or plotter. The two sets of checks cover different rules, so the reports can differ.

```sh
typecad-pcb erc --kicad
typecad-pcb drc --kicad
typecad-pcb export gerbers --kicad
```

## You still get a KiCad project

The build writes a complete KiCad project, including the project file (`.kicad_pro`), schematic (`.kicad_sch`), and board (`.kicad_pcb`). You can hand those files to someone who uses KiCad, or open the project yourself and carry on editing it in KiCad without typeCAD.

## Where do the parts come from?

We still use KiCad's library files. When the build needs a symbol or footprint it can't find locally, typeCAD/pcb downloads that file from KiCad's libraries on GitLab. [Symbols](https://gitlab.com/kicad/libraries/kicad-symbols) · [Footprints](https://gitlab.com/kicad/libraries/kicad-footprints)

## Can I build offline?

Yes, once all the parts your board uses are on your machine. We keep downloaded files in the project's `build/lib/` directory and in a cache shared by your projects. If you delete the build directory or use the same part on another board, typeCAD/pcb can get it from that cache. You'll need a connection the first time you use a library file you don't already have.

If a KiCad part fails to download, send us the library and part name. [Open an issue on GitHub](https://github.com/typecad/pcb/issues).
