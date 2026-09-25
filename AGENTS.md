# AGENTS.md — How we write

The house voice for Microfire (microfire.co) and typeCAD (typecad.dev). Use this for every
piece of user-facing copy: pages, docs, news posts, store listings, button labels, error
text, email templates. It does not apply to code comments, commit messages, or API
identifiers. A copy of this file lives at the root of each site's repo.

## Who's talking

A small shop that designs, builds, and ships its own hardware, and writes its own tools
because it needed them. We use what we sell, on real projects.

That gives us three standing rules:

1. **We, not "the company."** First person plural, always. "We moved things around", "we can
   probably make it for you", "We've created a few tools over the years". Never "the team at
   Microfire", never "our company policy is". When the reader does something, it's "you".
   "We" designs and ships; "you" builds and measures.
2. **A peer, not a brochure.** The reader is a maker, engineer, or hobbyist who is good at
   what they do. Assume competence, don't perform enthusiasm at them, and never talk down.
3. **Honest to a fault.** Say the limitation before the user hits it. Admit what we haven't
   figured out. Understate rather than oversell — let the thing be good and say so plainly.

## Tone

- **Understated.** The strongest sentence on the site is a flat declarative:
  "Single point is the least useful and should generally not be used."
  "We moved things around and they are hopefully organized a bit better now."
- **Self-aware, occasionally funny, never jokey.** One dry aside per page is plenty:
  "just another pcb2gcode GUI" / "Ok, sounds awesome" / "Bonus points for being able to run
  this LoRa bridge concurrently" / "it Just Works®".
- **Practical.** Instructions are steps, not prose. Warnings ride along next to the step
  they affect, not in a separate warnings section:
  "Make sure you pick the right frequency for your device/antenna/location as well. This
  firmware doesn't implement any limiting to work within rate-limited locations, so keep
  that in mind."
- **Blunt when it matters.** "Microfire cannot mark any package as a 'Gift' in order to
  avoid customs and duties fees." "You can use them or not."
- **Comfortable admitting gaps.** "There is some confusion that I wasn't able to sort out…
  If someone can sort this out, let me know on Discord."

## Syntax

- Short-to-medium declarative sentences. One idea per sentence. If a sentence needs a
  semicolon, try two sentences.
- **Contractions, always**: you'll, it's, doesn't, there's, won't, we've.
- Second person for the reader ("you'll find…"), imperative for instructions
  ("Pick the board and port, then Upload the code.").
- Bullets when three or more parallel things would sprawl in prose. The rd page's
  "Sometimes datasheets will give you: minimal information…" is the model — a flat list
  of shortcomings beats a paragraph of hedging.
- Numbered steps are bare ("## 1.", "## 2.") in blog write-ups, or emoji-headed in docs
  ("### 📦 Install the library"). Steps are imperative verbs; one step, one outcome.
- Headings are sentence case and short ("A new payment page", "The flow", "Also").
  Questions make good headings when the user would ask them:
  "What if I don't really care about the source files?" → answer in the first sentence:
  "You can use them or not."
- American spelling. I²C with the superscript. A space between number and unit
  (0.5 mS, 23.1 C, 5 minutes).

## Vocabulary

**Use**: get, make, build, show, find, use, pick, check, keep, handy, work(s), easy,
quick(ly), a few, most, plenty of concrete nouns.

**Avoid**: seamless, powerful, blazing(ly fast), effortless(ly), robust, comprehensive,
leverage(d), utilize, elevate, supercharge, revolutionary, enterprise-grade, cutting-edge,
state-of-the-art, solution(s) (for products), world-class, unlock, empower. Also avoid
corporate connectives (furthermore, moreover, "in order to" — write "to"), "please note",
"it is important to note", and exclamation points in body text.

Claims are concrete or they don't ship: "runs as fast as hand-written code", not
"incredibly fast". "several months on a 260 mAh battery", not "amazing battery life".

## Emoji

Emoji are wayfinding, not confetti — they label what a thing *is* so a page scans:

- Page titles and h1s: `🧰 Docs`, `💰 Buy`, `💥 mod-EC`, `🐌 The Shell Example`
- Step headings by job: 📦 install, 🔢 code, ➡️ upload/run, 🔎 view output, 📒 documentation,
  ⌨️ terminal, 🏠 Home Assistant
- Brand strings may carry their own motif: "🤖programmatically 💥create 🛰️hardware"

One emoji per heading, at the front, flat-color style. None inside sentences. None in
legal, security, or compliance sections — those drop all decoration (see Register).

## Register by context

| Context | Register |
| --- | --- |
| News/blog posts | Most casual. First person, digressions allowed, sign-off at the end. |
| Landing pages | Plain and bold. Short pitch, concrete bullets, one CTA. |
| Reference docs | Plain, precise, impersonal-ish but still "we" where a choice was made. Emoji step anchors. |
| Store/product pages | Plain, concrete, benefit-stated without hype. "Send an email to start a conversation." |
| Policies/legal | Flat declaratives, complete sentences, no emoji, no casual asides. |
| Security/CRA/compliance | Formal and thorough. "This section documents… It is written for integrators…" Precision outranks charm here. |

## Structure patterns

- **Landing**: name → one-line pitch → 3–4 concrete bullets → CTA. No mission statement.
- **Write-up/article**: 1–2 sentence lede → why this exists → BOM ("any sensor for testing,
  I'll be using an SHT30") → numbered steps → what you should see → sign-off.
- **Docs page**: overview → the fiddly bits (calibration, pinout table, wiring) →
  per-platform numbered steps (Arduino / ESPHome / Raspberry Pi) → links to fuller docs.
- **Endings** point somewhere human: "Join our Discord for comments or questions.",
  "We're on Discord, too.", "If you have questions or find a doc that needs work, open an
  issue on github.com/typecad." Use the real channel for the site — Discord for Microfire,
  GitHub issues for typeCAD — never invent one.
- **CTAs** are lowercase-friendly and concrete: "for business", "prototyping kits",
  "Try it with an online demo.", "Send an email to start a conversation". No "Learn More"
  or "Get Started Today!" energy.

## Mannerisms worth keeping

These recur because they work — reuse the pattern, not necessarily the exact words:

- "Bonus points for …"
- "…, so keep that in mind."
- "have a look at the YAML below"
- "And most importantly, …"
- "In no particular order they are:"
- "We've created a few tools over the years and some of them might be useful for others:"
- "we can probably make it for you" (the *probably* is doing honest work)
- "(hopefully) living documents" — hopeful hedging is part of the charm
- Answering a heading-question in the first sentence, flat.

## Before you ship copy

- Read it aloud. If a sentence sounds like a press release or a manual, break it or blunt it.
- Every claim checkable? Numbers, versions, and board names are sacred — voice never
  outranks accuracy.
- Is the limitation stated? If the copy describes what a thing does but not what it
  doesn't, find the boundary and say it.
- Does it end by pointing the reader somewhere human?
- Would the person who wrote "just another pcb2gcode GUI" sign their name under this? If
  it's too polished, it's off-voice.
