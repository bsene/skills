# Pragmatic Ruby Idioms

Ruby rewards a different set of instincts than typed OOP languages. This skill is a checklist for catching code that's *syntactically* Ruby but *idiomatically* still Java/TypeScript — and for applying the Pragmatic Programmer principles (DRY, orthogonality, reversibility) that Dave Thomas's own body of work (Programming Ruby, The Pragmatic Programmer, code kata) is built on.

## The translation smells to catch first

When reviewing code ported from a typed language, these are the highest-value fixes, roughly in order of how often they show up:

1. **`if obj.is_a?(Foo)` / `case obj.class`** → duck type instead. Ask "what does the caller actually need this object to *do*?" and check `respond_to?` or just call the method and let it raise. Ruby doesn't need `instanceof` guards where a well-formed interface already exists.
2. **Manual index loops (`for i in 0...arr.length`, `i = 0; while i < n`)** → `Enumerable`. `each`, `map`, `select`, `reject`, `reduce`, `each_with_index`, `each_with_object`, `group_by`, `partition`, `tally`, `each_slice`, `each_cons` cover nearly every loop shape. If you're about to write a manual index loop, there's almost always a named `Enumerable` method for it — reach for the name before the mechanism.
3. **Getter/setter boilerplate** → `attr_accessor`/`attr_reader`/`attr_writer`, or `Struct.new` / `Data.define` (Ruby 3.2+) for pure value objects instead of a hand-written class.
4. **`null`-style sentinel checks (`if obj != nil && obj.field`)** → `&.` safe navigation, or better, avoid `nil` as a valid state in the first place (Null Object pattern: a `NullUser` that responds to the same interface with harmless defaults) so callers don't need the check at all.
5. **Config objects built from many constructor arguments** → keyword arguments (`def initialize(name:, size: 10)`), not positional — self-documenting at every call site and immune to argument-order bugs.
6. **String-typed "type" fields driving a big `case`** → a `Hash` mapping type → behavior/class (see Factory pattern in design-patterns section), or polymorphism if the types are stable and few.
7. **Exceptions used for control flow across expected outcomes** → return a result object / use `throw`/`catch` for genuine non-local exits within a bounded scope; reserve `raise`/`rescue` for actually-exceptional conditions, per Ruby convention (and mirrors the "exceptions are exceptional" stance in Programming Ruby).

## Core stylistic defaults

- **Symbols for identity, strings for data.** `:status` not `"status"` when it's a fixed vocabulary (hash keys, enum-like values); a real `String` when the value is user data or gets mutated/interpolated.
- **Freeze what shouldn't change.** Constants holding mutable objects (`ARRAY = [1,2,3]`) should be `.freeze`d — Ruby doesn't make `CONST = value` immutable by default, only the binding.
- **Truthiness is `nil`/`false` only.** `0`, `""`, `[]` are all truthy in Ruby — a common bug when porting from JS/Python. Don't write `if count` expecting `0` to be falsy.
- **Prefer `&&`/`||` for boolean logic, `and`/`or` only for control flow.** `and`/`or` have lower precedence than assignment, which causes real bugs (`result = compute() or raise` doesn't do what it looks like).
- **One-line method syntax (`def name = expr`, Ruby 3.0+)** is idiomatic for pure single-expression methods (getters, predicates); don't force multi-statement logic into it.
- **`&:symbol`** (`arr.map(&:upcase)`) over `arr.map { |x| x.upcase }` when the block is exactly "call this one method" — but switch to a full block the moment more than one thing happens in it.
- **Guard clauses over nested conditionals.** `return unless valid?` at the top beats wrapping the whole method body in `if valid? ... end`.

## Metaprogramming: use with a clear reason, not by default

Pragmatic Ruby leans on metaprogramming more than most languages, but the same book that popularized it (Programming Ruby) is equally clear that it trades discoverability for expressiveness. Before reaching for `method_missing`, `define_method`, `class_eval`, or `instance_eval`:

- Prefer `define_method` over `method_missing` whenever the set of method names is knowable at load time — it keeps `respond_to?`, `method()`, and stack traces honest.
- If `method_missing` is genuinely needed (proxies, truly open-ended attribute names), always pair it with `respond_to_missing?`.
- An internal DSL (`instance_eval`-based block) is worth building when the same configuration shape gets written repeatedly (routes, specs, tasks) — not for a one-off config object, where plain keyword arguments are clearer.
- Metaprogramming that saves fewer than ~5 repetitions of boilerplate usually isn't worth the debugging cost of an extra layer of indirection. State this plainly in review rather than softening it — matching the direct, gap-flagging tone already used elsewhere.

## DRY and orthogonality, applied at the method/class level

- **DRY is about *knowledge*, not lines of code.** Two methods that happen to share five lines of syntax but encode different business rules should stay separate — collapsing them creates a false coupling that breaks the moment the rules diverge. Only extract a shared method when it's the same *decision*, not just similar-looking code.
- **Orthogonality**: changing how something is displayed shouldn't require touching how it's persisted; changing validation shouldn't require touching serialization. In Rails terms, this is the actual argument for service objects/POROs over fat ActiveRecord models — not "fat models are bad" as a rule, but "this model is doing three orthogonal jobs."
- **Reversibility**: prefer decisions that are cheap to undo (a config value, a small adapter) over ones that aren't (a chosen ORM, a chosen queueing library baked into fifty call sites) when the requirement is genuinely uncertain. This is a design-review lens, not a rule to cite on every PR — use it when someone is about to hard-wire a decision that the business context suggests might change.

## Rubocop / linting stance

When a style disagreement comes up and the project has a `.rubocop.yml`, defer to it — house style beats general idiom. Where there's no house style yet, the community-standard `rubocop` default cops (line length, trailing whitespace, frozen string literals, `Style/GuardClause`, `Style/SymbolArray`) are a reasonable default to suggest rather than inventing bespoke conventions.

## What this skill does *not* cover

- Structural GoF-style design decisions (Strategy vs. Template Method, when to use Factory) → design-patterns section.
- TDD workflow, RSpec structure, test doubles → testing section.
- This skill is about *how a given line of Ruby is written*, not *what the test-first process or the object graph should be*.

## Authoritative reference

For exact `Enumerable`/`Kernel`/core-class method behavior, argument forms, or anything syntax-version-dependent (one-line `def`, `Data.define`, pattern matching, `it` block parameter), check the official Ruby reference manual at [docs.ruby-lang.org/en](https://docs.ruby-lang.org/en/) rather than relying on memory — idiom recommendations should be tagged with the minimum Ruby version they require when it isn't universal.
