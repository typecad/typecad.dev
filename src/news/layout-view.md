---
title: "The layout view: arrange the board by hand, keep the code"
description: "The board viewer has a new Layout mode. Drag parts, draw traces with width and clearance rules watching you, then press apply — the whole session lands in your source files as ordinary TypeScript, and the board rebuilds."
date: 2026-09-25
published: true
---

> **Still in development.** The layout view works — we're using it on our own boards — but it isn't finished. Edges are rough, behavior may change between builds, and an apply now and then won't do what you meant. Read the "What it isn't" section before you trust it with a board you care about, and keep `revert` handy.

Boards get shaped by dragging things around until they fit. Until now that part happened in a separate PCB editor, or in your head, and the TypeScript was a transcription of whatever you did there. The board viewer has a new mode, **Layout**, that puts the dragging inside your project: you arrange parts and route copper on the rendered board, press one button, and the session is written back as ordinary typeCAD code. Nothing lives in a side format.

## Where to find it

Open the board viewer — **View Board**, or the *view on board* link in a component hover — and pick **Layout** in the view dropdown, next to Gerber, PCBA, and the rest. Zones fade back so the copper you're arranging reads clearly, and the ratsnest updates as you go. Press `?` for the key cheat-sheet; nobody remembers key maps, us included.

## Moving parts

- Drag a part, or select it and nudge with the arrow keys — hold Alt for 0.1 mm steps.
- `R` rotates, 90° at a time.
- Silk and fab text drags the same way. Double-click a part's value or reference to edit it in place, and drag the little reference/value labels where you want them.
- Traces that end on a moved part's pads come along for the ride, so a part you slide across the board doesn't leave its routing behind.

Double-click still jumps to source. That didn't move.

## Drawing copper

Press `X` on a pad or trace to start a route. Click to anchor, double-click (or land on a pad) to finish, `Esc` cancels, `Backspace` undoes the last anchor. While routing:

- `V` drops a via and continues on the next layer; `Shift+V` picks the far layer first if you want a blind or buried via.
- `[` and `]` step the trace width (`Alt` for ±0.01), `Shift+[` / `Shift+]` step the via, `\` goes back to the net's default.
- `P` sizes the trace for a current you type in (IPC-2222), and carries it into the source as `powerInfo` so the build keeps enforcing the width.
- `Z` solves for 50 Ω against your stackup and leaves a comment recording the intent.
- `I` adopts the width of a trace you click on.

The gray band around your route is the clearance keep-out from your board rules, and anything you push into it turns red. The width floor and net-class defaults come from the board's `.kicad_pro`, or from a `typecad.rules.json` you put beside `typecad.conf.ts` when you'd rather hand-author them.

Deleting is the same story in reverse: `U` grows a segment selection, `Del` removes it — off the board now, and out of the source when you apply.

## Apply & rebuild

**revert** throws the session away. **apply & rebuild** is the interesting button. It writes everything you did into `src/` — placements move into their `pcb` literals, routes become `TrackBuilder` chains with their widths, vias, and power contracts, text edits rewrite their `.text()` calls — then rebuilds the board, runs the rule check, and re-renders the viewer. A session that moved `R1` and drew a small VCC trunk lands something like this:

```ts
r1.pcb = { x: 12, y: 11 };

const route1 = new TrackBuilder(typecad, { net: 'VCC' })
  .powerInfo({ current: 1.5, maxTempRise: 10 })
  .from({ x: 12.5, y: 11 }, 'F.Cu', 0.45)
  .to({ x: 20, y: 11, layer: 'F.Cu', width: 0.45 })
  .via({ size: 0.6, drill: 0.3 })
  .to({ x: 20, y: 20, layer: 'B.Cu', width: 0.45 });

typecad.create(r1, route1);
```

That's the same code you'd have typed. The next git diff, the next code review, the next person who opens the project — it's all plain TypeScript. And deleting a segment later shortens (or splits) that chain, so a removed piece of copper is a real gap in the source, not an annotation on top of it.

## What it isn't

- A placement has to be a literal to move. `r1.pcb = { x: 12, y: 11 }` moves; `x: b.center.x` is skipped and reported — if we can't say what your expression should become, we don't guess.
- Deleting from source matches plain numeric coordinates in route chains. A chain with computed points is left alone and named in the report.
- Apply runs a full rebuild and gerber re-export, so it takes tens of seconds. Anything that couldn't be applied shows up by name in the output channel and a status message — being told is slower than silent, but only one of them is honest.

The layout view rides in the typeCAD/pcb extension your project already carries — open the Board viewer and switch the view to Layout. If a route comes out wrong, or a skip message doesn't make sense, open an issue on [github.com/typecad](https://github.com/typecad). We'd rather hear about it.
