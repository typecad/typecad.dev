---
title: "typecad-hal sbom: a build-true SBOM, stamped on every build"
description: "EU CRA obligations are phasing in, and firmware shipping into the EU needs an SBOM. As of today, every typecad-hal build writes one for you — what the build actually linked, as CycloneDX 1.6 or SPDX 2.3, stamped next to the firmware."
date: 2026-09-22
published: true
---

The EU Cyber Resilience Act's reporting obligations have applied since 11 September 2026, and the main obligations — CE marking, essential requirements, a technical file that includes an SBOM "in a commonly used format" — arrive 11 December 2027. If you place products with digital elements on the EU market, your firmware needs a software bill of materials. As of today, `typecad-hal` writes one for you on every build.

## The BOM is the build's own record, not a scan

Generic SBOM tools guess from directory listings — every manifest entry, every file that looks like a dependency, build tools mixed into the product's runtime components. `typecad-hal sbom` doesn't scan; it reports what the toolchain already knows:

- **Linked modules only, by default** — the west modules whose sources your build actually compiled, filtered through `compile_commands.json`. A workspace carries every vendor HAL; your binary carries two or three. The SBOM records the two or three. (`--all` widens it to the whole manifest.)
- **Immutable identities** — each module at its checked-out commit SHA, with the manifest revision and VCS URL recorded alongside. The Zephyr kernel gets its real version (4.4.0, not a SHA) parsed from the tree.
- **Licenses from the source** — the same SPDX resolution the `licenses` command uses, read from each module's actual `LICENSE` file.
- **The firmware itself** — the main component is your application, carrying the SHA-256 of `zephyr.bin`.
- **The board** — a CycloneDX `device` component for the target, so the record says what the binary is *for*.
- **The toolchain where it belongs** — cuttlefish, framework, `@typecad/hal`, and the pinned SDK go in the CycloneDX `formulation` block (the build environment), never in the product's runtime components.

Output is CycloneDX 1.6 JSON by default — `--format spdx` emits SPDX 2.3 instead. Both are schema-valid against the official specifications.

## Stamped on every build

Every successful `typecad-hal build` writes `<buildDir>/sbom.cdx.json` next to `zephyr.bin`, best-effort — a stamping failure never blocks a build, and an incomplete record (say, `west list` failed) is skipped rather than written wrong. The serial number is a deterministic UUID v5 over the component identities and artifact hash, so regenerating the BOM for the same build reproduces the same document.

```
⇉ Generating SBOM (linked dependencies only)
✓ SBOM written to src/out/build/sbom.cdx.json
  • components ........ 2 module(s), 2 with a resolved license (0 unknown)
  • board ............. typecad_f411_dev
  • firmware .......... zephyr/zephyr.bin sha256 e94ae72b6e9df785…
  • toolchain ......... formulation: cuttlefish 1.0.0-alpha.18 / hal 1.0.0-alpha.18 / SDK pin 1.0.1
! manifest: floating-revision — manifest revision 'HEAD' moves between west updates — the recorded SHA is the immutable identity; pin by SHA or tag for a reproducible BOM
```

## Gates for release

Three flags turn the record into a release gate:

- **`typecad-hal sbom --check`** — regenerate from the current build and compare against the recorded BOM. Fails on component drift, on a firmware binary newer than its record, or on no record at all. Wire it into CI.
- **`typecad-hal sbom --diff old.json new.json`** — what changed between two builds: components added, removed, version- or license-changed. That delta is the input to update notifications and vulnerability reassessment.
- **`typecad-hal sbom --strict`** — exit 1 when a manifest revision floats (`main`, `HEAD`) or a commit SHA can't be resolved. A BOM whose components can't be pinned to immutable commits isn't a compliance record.

`--stdout` prints only the JSON for piping, and `sbom --all --strict` composes as you'd expect.

## Try it

```sh
typecad-hal build          # stamps src/out/build/sbom.cdx.json
typecad-hal sbom --check   # verify the record still matches the build
```

The `licenses` command is unchanged — it shares the same inventory, so the license table and the SBOM can never disagree about what your firmware contains.

Questions, or a record that looks wrong? Open an issue on [github.com/typecad](https://github.com/typecad) — we'd rather hear about it.
