---
title: "The KiCad round-trip, grown up"
description: "typecad-pcb import got an overhaul: every board element now syncs back into your TypeScript — zones, routes, silkscreen text, the stackup — with snapshots, convergence checks, and a live watch mode that updates source while you edit in KiCad."
date: 2026-10-01
published: true
---

The promise of code-as-hardware has always had a seam: you could generate a board from TypeScript, but the moment you touched it in KiCad — nudged a part, dragged a zone, rerouted a trace — the source and the board drifted apart, and the importer that was supposed to reconcile them only caught half of what you'd changed. That seam is the project now. This is what changed.

## What syncs

Everything the board file carries that has a typeCAD representation:

- **Component placement** — position, rotation, front/back side, matched by the `Code` property typeCAD stamps into every footprint, with reference-number and stale-path fallbacks.
- **Text layouts** — reference, value, and fab text positions, sizes, fonts, mirror and hide flags, imported by default now (this used to be opt-in).
- **Board outline** — rect, filleted, polygon, circle, and cutout forms all regenerate their source calls.
- **Zones and keepouts** — geometry, fill settings, thermal reliefs, rule-area restrictions, layer wildcards.
- **The routing section** — every track chain, via, and the `create(...)` spread list, regenerated as a whole whenever any vertex moves.
- **Silkscreen text** on any layer, with fonts, justification, and hide state.
- **Board graphics** — silk lines, rects, circles, arcs, and polys — and the full **layer stackup**: dielectric thicknesses, materials, εᵣ, loss tangents, mask and silkscreen colors.
- **Arc-shaped tracks** — curved copper arrives as tessellated segments on the same net, so it stops vanishing.

And everything that doesn't have a representation is **reported, with counts**, instead of silently dropped: dimensions, beziers, images, footprint-internal edits. A silent skip is a decision you didn't make.

## It writes your code, not its own

The rewriter recognizes the code you actually write, not just what the generator emits. Zones declared with `bounds:`, fill options written flat instead of grouped, outlines that take an object, semicolon-free style, CRLF, class-field components — all of it syncs, and when your form already matches the board, your form is left alone. The importer doesn't canonicalize just to converge.

When it does write, the result is the code you'd have typed: `const track_VCC: TrackBuilder[] = []` with the net riding the builder, placement literals updated in place, statements inserted at sensible anchors using your own receiver names.

## Nothing lands without proof

This is the part we're proudest of. Every apply cycle now:

1. **Snapshots** your entire analyzed source set before the first write — a bad run is fully recoverable with `import <board> --restore`.
2. **Checks ownership** — writes may only touch files that parsed cleanly this cycle, so a half-saved editor buffer can't send edits to the wrong file.
3. **Verifies after writing** — every written file must still parse, and every applied change is recomputed and must come back empty. Anything that didn't converge rolls the snapshot back and tells you exactly what failed, by name.
4. **Fingerprints the board** — a semantic hash printed every run, so "everything is in sync" is a claim you can verify, not a message you trust.

A seeded fuzz harness feeds random boards through random source styles and asserts parse-after-write, convergence, and byte-idempotency — the failure classes that once corrupted projects now have to get past a gate that runs on every import, not just in CI.

## Live sync with KiCad

```sh
npm run kicad_sync
```

That's the whole workflow. The watcher monitors your `.kicad_pcb` (and your source), and every time KiCad saves, the changed elements land in the right `.ts` files — debounced, mtime-gated, resilient to half-written files. Edit in KiCad, save, watch the diff appear in your editor; run the build when you want the regenerated board and gerbers. In VS Code there's a command for it too: **typeCAD/pcb: Start KiCad Sync**.

## The `--dry-run` habit

Before trusting a new project's round-trip, dry-run it:

```sh
typecad-pcb import build/board.kicad_pcb --dry-run
```

Every pending change prints with its file, line, and a `- old` / `+ new` edit preview — nothing written, no prompts. It's the fastest way to see what a cycle would do to your source.

## DRC grew up with it

The native design-rule check was audited against `kicad-cli` across five boards, and seven defects fell out — through-vias that didn't span inner layers (splitting nets into phantom "unconnected" items), copper straddling the board edge reading as clear, polygon silkscreen invisible to the silk checks, pads bridging their own duplicated parts. The two engines now agree item-for-item on the checks both implement, and the differences that remain are documented by name, not discovered by surprise.

---

The round-trip is the product: one representation, in the language the rest of your project speaks. If something comes back wrong — a sync that won't converge, a rollback you didn't expect, a shape that lands strange — the snapshots and fingerprints exist so you can show us exactly what happened. [Open an issue](https://github.com/typecad). We'd rather hear about it.
