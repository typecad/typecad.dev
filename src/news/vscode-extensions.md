---
title: New VS Code extensions for pcb and hal
description: The typeCAD/hal extension merges three extensions into one board-aware editor, and typeCAD/pcb gets a bundled board viewer with two-way cross-probing — both ship inside every new project.
date: 2026-09-18
published: true
---

We rebuilt both typeCAD editor extensions, and neither needs a marketplace install anymore: `create` vendors them straight into the project. Open the project, and the editor experience is already there.

## typeCAD/hal — three extensions become one

The `typecad-ui`, debugger, and intel extensions merged into a single **typeCAD/hal** extension that `typecad-hal create` drops into `.vscode/extensions/`. What it does:

- **Diagnostics that match the build exactly** — the editor runs the project's own engine in no-emit mode on every save, so the Problems panel can never drift from `build` output
- **Quick-fixes** — pin-capability errors offer a swap to the first capable pin; ownership errors get *Borrow by reference* and *Make const* fixes
- **Hovers and inline fact chips** — `new ADC(PA0)` explains its silicon routes on hover and shows `⌁ PA0 · PWM pwm2 ch1 · ADC adc1 ch0` right on the line
- **Flash & Monitor** — a `▶` CodeLens on the entry file, `⚡ Run on Hardware` on tests, and a serial picker that lists attached USB devices with VID:PID and re-validates your cached port
- **`.ui` language support** — highlighting, snippets, and markdown injection for UI files
- **F5 native debugging** over GDB on probe-equipped boards — the old printf/breakpoint instrumentation is gone, and serial print via `USB0.writeLine(...)` replaces it everywhere

## typeCAD/pcb — the board lives next to the code

`typecad-pcb create` now bundles the **typeCAD/pcb** extension into new projects, workspace-scoped:

- **Pin hovers** — reference, value, footprint, placement, and a per-pad table with nets and connected status, plus a *view on board* link
- **Board viewer panel, five views** — Gerber (layers, fab report, DRC markers), PCBA (the assembled-board render), Blueprint (an engineering drawing with dimension lines and a title block), ngspice (traces colored by voltage, parts by power, animated current flow after `typecad-pcb simulate`), and Copper ΔT (IPC temperature rise across wires, vias, pours, and the FR4 itself)
- **Cross-probing both ways** — double-click a trace, pad, or component to jump to its source line; hover a component or net and zoom straight to it
- **Ambient board state** — a status bar with build/DRC counts, a ▶ Build Board CodeLens, and unconnected pads and DRC hits in Problems with *show on board* quick-fixes
- **Stays current** — every build re-renders the viewer, and your viewport, layers, and highlights survive

## Where to read more

Full details and command tables are on the new docs pages: [The VS Code extension (pcb)](/pcb/docs/vscode) and [The VS Code extension (hal)](/hal/docs/vscode).
