---
title: "The customer simulation: eleven fixes, all closed on hardware"
description: "We built a real project with our own toolchain the way a first-time user would — no workarounds allowed. It surfaced eleven bugs, including a green that lied and a random number that could crash the board."
date: 2026-10-27
published: true
---

Our demos and tests weren't catching a class of bugs, and the reason is a little embarrassing: we've been using this toolchain long enough that we write around its rough edges without noticing. So we ran a simulation. The assignment was a realistic first-day project — a sentry fleet agent: MQTT fleet enrollment, sensor sampling, an event log, defensive code written the way a careful newcomer writes it. One rule: every workaround is a bug, and it gets filed, not routed around.

Eleven came out. Each one was reproduced, fixed, and verified on an ESP32-S3 board before it landed. Here's the tour, worst first.

## The green that lied

Three of the eleven were worse than crashes — they were tools reporting success while doing nothing.

`trace capture --flash` re-spawned the trace module instead of the CLI: exit 0, zero output, nothing flashed. The capture then recorded whatever firmware was already parked on the board — a ten-minute soak "passed" against the wrong binary until a stack gate caught it.

The test runner's wire checksum XORed UTF-16 code units while the device XORs bytes. Every frame carrying a non-ASCII character arrived "corrupt", the test inside it silently dropped, and a suite that lost every frame could still print `PASS` with `Tests (0)`. The host now XORs the same UTF-8 bytes the device does, orphaned frames surface as a failed protocol check, and an empty parse is a hard error.

And the scaffolded out-of-box test emitted its whole protocol exchange into the serial port's post-flash reopen gap — bootloader-flashed boards take a second or two to come back after flashing, and the suite was done talking before the runner started listening. Every hardware run timed out. There's a new `test.warmupMs` config option (default 2500 ms, 0 disables) so the firmware settles before the suite starts — and the run summary now counts build failures and run failures separately, instead of calling a serial timeout a build failure.

## The corruptors

`Random.upTo(n)` could draw `n`. The docs — and the shim's own comment — say half-open: `[0, n)`. The code computed `[0, n]`. So `arr[Random.upTo(arr.length)]` read one element past a heap block once every n+1 draws. On the bench that aborted the board on the second enrollment; the first boot got lucky.

Lambda bodies rendered through the flat statement renderer, so a local arrow function containing an if/else came out as `auto check = [&](...) -> void { if (ok) };` — which is not C++ any compiler accepts. Both lambda paths render structured statements now; switch and try inside a lambda body diagnose loudly instead of emitting something broken.

Smaller but in the same family: a method call through a `this`-capture cell emitted ill-formed C++, class-member callbacks registered twice per call site (two ISRs for the price of one), and a tree-shaken class left its capture cells behind for the compiler to find.

## Warnings you can trust

The rest were diagnostics that lied or cried wolf — the kind that teach you to ignore warnings.

Calling the hal's own `Random.int()` warned "rename 'int'" — a property name you can't rename. Property-access names are exempt now; a declared variable named `int` still warns, because that one's real. The forEach-on-a-Map hint recommended the exact `Map.keys()` form the lowering rejects; it points at the parallel-key-array idiom that actually lowers. Imported string constants fold as carrier facts, so `{ psk: AP_PSK }` stops warning "cannot be carried into the generated C++" while the generated C++ carries it perfectly. And `isNaN(parseInt(...))` — a guard that reads fine in TypeScript — warns at the exact site, because in the emitted C++ it's a constant false: `atoi` returns 0 for junk, never NaN.

## What's new for you

- `test.warmupMs` (default 2500, `0` disables) — the firmware settles after flashing before the suite starts. Covered on the [testing docs page](/hal/docs/testing).
- `typecad-hal test` summaries separate build failures from run failures.
- `create --framework` accepts the catalog id (`zephyr`) and the package name (`@typecad/framework-zephyr`) — the config file spells one, the docs said the other, both work now.
- `Random.upTo` and `Random.between` are actually half-open now, which the [docs already claimed](/hal/docs/signal-utilities).

If you hit one of these on a board, open an issue on [github.com/typecad](https://github.com/typecad) — that's also where the fixes live if you want the details.
