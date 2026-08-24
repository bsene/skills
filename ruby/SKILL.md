---
name: ruby
description: >
  Write, review, and refactor Ruby and Rails code — idiomatic style (duck typing, Enumerable, judicious metaprogramming), GoF design patterns applied the Ruby way (Strategy, Observer, Template Method, Decorator, Factory, Singleton, Adapter, Proxy, Composite, Command, Builder, DSLs), and testing (RSpec/Minitest structure, mocking discipline, FactoryBot, Rails test-pyramid layering, mutation and property-based testing as targeted diagnostics for high-risk code). Use whenever the user writes, reviews, or refactors Ruby or Rails code; asks "is this idiomatic," "what pattern fits this," or "how would a Rubyist write this"; ports code from Java, C#, TypeScript, or Python and it still reads like the source language; picks between a class, module, Struct, or block; writes or reviews an RSpec/Minitest spec, weighs mocking vs. a real object, or sets up test data; or checks whether a Rails concern/service object/PORO is over- or under-engineered. Based on Russ Olsen's "Design Patterns in Ruby," Dave Thomas's "Programming Ruby"/"Pragmatic Programmer," and Noel Rappin's Rails testing books.
---

# Ruby

One skill, three lenses on the same code — load the reference file matching what the person actually needs rather than all three at once.

| Reference | Load when the question is about... |
|---|---|
| `references/idioms.md` | How a given line/method should be written — duck typing vs. type checks, `Enumerable` vs. manual loops, metaprogramming judgment calls, DRY/orthogonality as a review lens. Style-level. |
| `references/design-patterns.md` (+ `references/design-patterns-catalog.md` for full code) | Structural decisions — which GoF pattern (if any) fits a design problem, translating a class hierarchy into something more composable, whether a "pattern" is even warranted. |
| `references/testing.md` | Test structure — RSpec/Minitest conventions, which layer of the test pyramid a behavior belongs in, mocking vs. real objects, FactoryBot vs. fixtures; also mutation testing (`mutant`) and property-based testing (`propcheck`/`rantly`) for the specific high-risk cases where example-based specs alone leave a gap. |

A single review often touches more than one lens (e.g., "review this service object" can raise a style smell, a missing Strategy, and a test gap all at once) — load whichever reference files the specific findings need; don't preload all three by default.

## Fast triage, before loading anything

- **"Is this idiomatic Ruby?" / code ported from a typed language** → `idioms.md`. Its own quick list (`is_a?` checks, manual index loops, getter/setter boilerplate, nil-sentinel checks) catches most of what shows up in practice without needing the full file.
- **"What pattern should I use here?" / a class hierarchy or big conditional smells wrong** → `design-patterns.md`. It leads with four questions (what varies, interface vs. implementation, composition vs. inheritance, YAGNI) that often resolve the question before naming a pattern at all.
- **Writing or reviewing a spec file, deciding what to mock** → `testing.md`. Leads with a table for picking the right test layer, since most flaky/slow suites come from testing at the wrong layer rather than bad assertions.
- **General "review this Ruby/Rails file"** → skim for smells across all three categories (style, structure, test coverage/shape), then load only the reference files needed to back up the specific findings.

## Cross-cutting stance, shared across all three lenses

- **YAGNI beats cleverness.** Whether it's a premature Factory, an unneeded metaprogramming layer, or an over-mocked test, the recurring failure mode in Ruby code is building machinery for a variation that doesn't exist yet. Flag this plainly wherever it shows up rather than only in the design-patterns lens.
- **Anti-overclaiming.** If code is genuinely simple and doesn't need a pattern, a rewrite, or more test scaffolding, say so — don't manufacture a recommendation to seem thorough.
- **Version-sensitivity.** Ruby's idiomatic surface has moved fast (one-line `def`, `Data.define`, pattern matching, `it` block parameter). Tag any version-dependent recommendation with the minimum Ruby version it needs.

## Authoritative reference

For exact core-class/method behavior or anything version-sensitive, check the official Ruby reference manual at [docs.ruby-lang.org/en](https://docs.ruby-lang.org/en/) (or [/en/master](https://docs.ruby-lang.org/en/master/) for trunk) rather than relying on memory. For RSpec/FactoryBot API specifics, check rspec.info / RubyDoc.info. Each reference file below repeats the pointer relevant to its own domain.
