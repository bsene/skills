# Ruby Design Patterns

Source: Russ Olsen, *Design Patterns in Ruby* (Addison-Wesley, 2007) — the GoF's 23 patterns reworked for a dynamically-typed, duck-typed, block-carrying language. The book's throughline, and this skill's throughline: **most patterns exist to work around the absence of first-class functions and duck typing in Java/C++. Ruby already has both, so half the GoF catalog collapses into a method call, a block, or a module.** Reach for the heavyweight class-based version only when the lightweight version stops being enough.

## Before recommending any pattern

Run the four checks from Chapter 1 first — they cut the GoF's 23 down to the ~14 that pull weight in Ruby, and they're the actual design skill; the patterns are just named consequences of applying them.

1. **Separate what changes from what stays the same.** If nothing in the code varies independently, there's no pattern to apply — just write the straight-line code.
2. **Program to an interface, not an implementation.** In Ruby "interface" means duck type, not a formal `interface` keyword — the caller should depend on "responds to `#call`" or "responds to `#each`," not on a concrete class.
3. **Prefer composition over inheritance.** If the design reaches for a subclass to get one varying behavior, that's a smell — pass in a collaborator (Strategy) or a block instead.
4. **YAGNI.** Olsen's running joke through the book: don't build the Factory/Builder/Interpreter machinery for a variation that doesn't exist yet. Every pattern chapter ends with "using and abusing" — the abuse case is almost always "applied pre-emptively." Flag this explicitly when reviewing code, and hold the same bar when generating new code — don't scaffold a pattern for hypothetical future variants.

If the person's actual problem is "I have a big if/case on type" or "I have a class hierarchy that only differs in one method," identify which of the four checks is failing before naming a pattern.

## Quick pattern selection table

| Symptom in the code | Ruby-idiomatic fix | Formal pattern (only if idiomatic fix isn't enough) |
|---|---|---|
| Subclasses that override one step of a multi-step algorithm | Keep it — this *is* the idiomatic form | Template Method |
| An object needs to swap an algorithm at runtime | Pass a `Proc`/lambda or any object responding to `#call` | Strategy |
| Objects need to react to another object's state changes | `require 'observer'` or a plain array of `Proc`s called on change | Observer |
| Tree of part/whole objects treated uniformly | Give leaf and composite the same interface (`#each`, `#total`); duck typing does the rest | Composite |
| Walking a custom collection | Include `Enumerable` + define `#each`; don't hand-roll an iterator class | Iterator |
| Need undo/redo, queuing, or logging of actions | A `Proc` per action, or a tiny class with `#call`/`#unexecute` | Command |
| Two APIs don't line up | A thin wrapper object, or `Object#extend` with a module for one-off adaptation | Adapter |
| Need lazy loading, access control, or remote delegation | `method_missing` + `respond_to_missing?` forwarding to a target | Proxy |
| Want to add behavior to one object without touching its class | `Object#extend` with a module, or wrap-and-delegate | Decorator |
| "There must be exactly one of these" | Ask first whether a plain global/constant module is honest about what's happening — see Singleton caution below | Singleton |
| Code decides which class to instantiate based on a type/config | A `Hash` mapping keys to classes/`Proc`s, or a class method that returns `self` for polymorphic construction | Factory Method / Abstract Factory |
| Constructing a complex object step by step | A block-based builder (`yield self` from `#initialize`) or a struct-like PORO | Builder |
| Parsing/evaluating a small custom language | Usually: don't. Reach for a Hash/Struct AST + recursive `#evaluate` only for a real grammar; for config-like needs, an internal DSL is simpler | Interpreter |
| Config or setup code reads like a mini language | Internal DSL: `instance_eval` a block against a builder object | Domain-Specific Language (Ch. 16, Ruby-only) |
| Repetitive boilerplate class definitions | `class_eval`/`define_method` to generate methods, or `Module#included` hooks | Metaprogramming (Ch. 17, Ruby-only) |
| API requires a lot of upfront configuration | Sensible defaults derived from naming (`ActiveSupport::Inflector`-style), config only for the exception | Convention Over Configuration (Ch. 18, Ruby-only) |

Full code-level treatment of each pattern — idiomatic Ruby implementation, the "using and abusing" caution, and where it shows up in real gems (ActiveRecord, Rack, RSpec, etc.) — is in `references/design-patterns-catalog.md`. Load it when the person wants an actual implementation rather than a pointer to the right pattern.

## Ruby-specific traps to call out during review

- **Singleton is usually a lie.** Olsen's own conclusion: a Ruby "Singleton" is almost always just a global variable with a formal-looking API. Before reaching for the `singleton` module, ask whether the real requirement is "one per test run" (then it's a test-isolation problem, not a design problem) or "one per process" (then a module with module-level methods is more honest than a class pretending to be instantiable-but-not-really). Flag Singleton usage in reviews as a place to double-check whether it's silently coupling every caller together and making tests hard to isolate — this lines up with Olsen's own "Curing the Testing Blues" caution.
- **Don't build a class hierarchy where a `Proc` would do.** If a "Strategy" or "Command" object has exactly one public method and no state beyond what's captured in a closure, it doesn't need a class — a block or lambda is the pattern, not a workaround for not having one.
- **`method_missing` is a scalpel, not a hammer.** Proxy and dynamic Decorator both lean on it. Always pair it with `respond_to_missing?` — a proxy that fails `respond_to?` checks or breaks `method(:foo)` introspection is a common, subtle bug. Prefer `Forwardable`/`SimpleDelegator` from stdlib over hand-rolled `method_missing` forwarding when plain delegation is all that's needed.
- **Composite needs one contract, not two.** The pattern only pays off if leaf and composite nodes genuinely share every method the caller calls. If the composite needs `children` and the leaf doesn't, either give the leaf an empty `children` (Olsen's recommendation) or reconsider whether Composite is the right shape at all.
- **Convention over Configuration is a Ruby/Rails superpower, but it hides control flow.** When reviewing Rails code, treat convention-driven magic (callbacks, `has_many` reflection, autoloading) as a place where the person reading the code six months from now needs a comment or a clear naming convention — the "using and abusing" cost of this pattern is discoverability, not correctness.

## When NOT to name a pattern at all

If the person's Ruby code is genuinely simple — one class, one responsibility, no variation point — say so plainly instead of finding a pattern to apply. Pattern-naming pressure ("what's your favorite pattern?" job-interview culture, referenced in the book's own foreword) is itself a design smell when it pushes people toward ceremony a duck-typed language doesn't need.

## Authoritative reference

When an exact method signature, `Enumerable`/`Comparable` contract, or core-class behavior needs verifying rather than recalled from memory, check the official Ruby reference manual at [docs.ruby-lang.org/en](https://docs.ruby-lang.org/en/) (pick the version in use; [/en/master](https://docs.ruby-lang.org/en/master/) tracks trunk) before asserting API details — especially for anything version-sensitive (e.g. `Data.define`, one-line `def`, pattern matching), since patterns implemented with newer syntax should be flagged as requiring the corresponding Ruby version.
