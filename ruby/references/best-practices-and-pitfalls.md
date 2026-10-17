# Ruby Best Practices and Pitfalls

Source: _Ruby Best Practices_ (Brown, 2009). Paraphrased; verify details against current Ruby docs.

## Interfaces and metaprogramming

| Topic            | Guidance                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Block DSLs       | `instance_eval` makes the block lose caller ivars and `self`. Accept an arity-1 block (`yield builder`) and only `instance_eval` when the block takes no args |
| `method_missing` | Always pair with `respond_to_missing?`; delegate unknown names to `super`; whitelist accepted patterns                                                        |
| Dynamic dispatch | `public_send` for untrusted names (not `send`); validate against an allowlist first                                                                           |
| Hooks            | `inherited`, `included`, `method_added` run at definition time; keep them small and idempotent                                                                |
| Reflection       | `define_method` closes over local state; use `instance_method` to capture and wrap originals                                                                  |
| Eval             | Never `eval` or `instance_eval` strings built from user input                                                                                                 |
| Blank slates     | Subclass `BasicObject` for proxies and DSL objects; reach globals with `::`                                                                                   |

## Class design

- Avoid `@@class_variables`: they are shared across the whole hierarchy. Use class-level instance variables (`@x` in `class << self`).
- Do not hardcode your own class name inside methods; use `self.class` or `new` so subclasses work.
- Prefer composition and modules over deep inheritance; a mixin should rely on a minimal contract (`each`, `<=>`) and say so.
- Keep `initialize` cheap; offer named constructors for variants.

## Functional techniques

- Memoize pure functions with `Hash.new { |h, k| h[k] = compute(k) }`; never memoize impure methods, and bound the cache.
- Prefer `map`/`select`/`reduce`/`each_with_object` over index loops; use `lazy` for large or infinite sequences.
- Return new values from pure helpers; mutate only at clear boundaries.

## Text and files

| Topic         | Guidance                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Regex anchors | `^`/`$` match per line; use `\A`, `\z` for whole-string validation                                        |
| Quantifiers   | `*` always matches (even empty); use `+` when "at least one" is meant                                     |
| Alternation   | Prefer character classes (`[Jj]ames`) and shortcuts (`\d`) over alternations; keep patterns tight         |
| Atomic saves  | Write to a temp file in the same directory, then `File.rename` over the original; keep a backup if needed |
| File handles  | Use block forms (`File.open { }`, `Dir.mktmpdir { }`) so cleanup is automatic                             |
| Paths         | `File.join`, `File.expand_path(__dir__)`; avoid string concatenation                                      |

## Debugging and logging

1. Reproduce in isolation: cut the failing case down until removing anything makes it pass.
2. Form a hypothesis, then test it with `p`/`pp`, `irb`/`binding.irb`, or a failing test before editing.
3. Turn the minimal repro into a regression test.
4. Use `Logger` with levels (`debug`, `info`, `warn`, `error`) and a single configured instance, not scattered `puts`.
5. Check `Object#inspect`/`to_s` on your classes so logs are readable.

## Project and packaging

- Conventional layout: `lib/`, `test/` or `spec/`, `bin/`, gemspec; one top-level namespace module.
- Declare runtime dependencies in the gemspec with pessimistic constraints (`~> 1.2`); dev tools go in the Gemfile.
- Keep the `lib/` entry file as a thin loader (`require_relative`); avoid load-path mutation.
- Ship a README, license, and changelog; follow semantic versioning.
