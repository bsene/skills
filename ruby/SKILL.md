---
name: ruby
description: >
  Write, review, and improve Ruby and Rails code — idiomatic style (duck typing, Enumerable, judicious metaprogramming), GoF design patterns applied the Ruby way (Strategy, Observer, Template Method, Decorator, Factory, Adapter, Composite, Command, Builder, DSLs), and testing (RSpec/Minitest structure, mocking discipline, FactoryBot, Rails test-pyramid layering, mutation and property-based testing for high-risk code). Use whenever the user writes, reviews, or refactors Ruby or Rails code; asks "is this idiomatic" or "what pattern fits"; ports code from Java, C#, TypeScript, or Python; picks between a class, module, Struct, or block; weighs mocking vs. real objects; or judges a Rails concern/service object/PORO. DO NOT USE for language-agnostic OOP/SOLID design (use `object-oriented-programming`) or general test strategy outside Ruby (use `testing`).
---

# Ruby

Load the reference only when the question needs it. Writing or reviewing a spec, or deciding what to mock, is that case.

| Reference               | Load when the question is about...                                                                                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/testing.md` | Test structure — RSpec/Minitest conventions, which layer of the test pyramid a behavior belongs in, mocking vs. real objects, FactoryBot vs. fixtures; also mutation testing (`mutant`) and property-based testing (`propcheck`/`rantly`) for the specific high-risk cases where example-based specs alone leave a gap. |

For a general "review this Ruby/Rails file", skim for smells across style, structure, and test coverage, then load the reference only if a finding needs it.

## Cross-cutting stance, shared across both lenses

- **YAGNI beats cleverness.** Whether it's a premature Factory, an unneeded metaprogramming layer, or an over-mocked test, the recurring failure mode in Ruby code is building machinery for a variation that doesn't exist yet. Flag this plainly wherever it shows up rather than only in the design-patterns lens.
- **Anti-overclaiming.** If code is genuinely simple and doesn't need a pattern, a rewrite, or more test scaffolding, say so — don't manufacture a recommendation to seem thorough.
- **Version-sensitivity.** Ruby's idiomatic surface has moved fast (one-line `def`, `Data.define`, pattern matching, `it` block parameter). Tag any version-dependent recommendation with the minimum Ruby version it needs.

## Integrated example

```ruby
# Strategy via duck typing + Enumerable + Data.define (Ruby 3.2+), tested with real objects
Order = Data.define(:total, :country)

class Pricing
  def initialize(rules) = @rules = rules # any #call(order) responder: lambda, method, PORO

  def final(order) = @rules.sum(order.total) { |rule| rule.call(order) }
end

RSpec.describe Pricing do
  it "applies every rule" do
    eu_vat = ->(o) { o.country == "FR" ? o.total * 0.2 : 0 }
    expect(described_class.new([eu_vat]).final(Order.new(100, "FR"))).to eq(120.0)
  end
end
```

## Authoritative reference

For exact core-class/method behavior or anything version-sensitive, check the official Ruby reference manual at [docs.ruby-lang.org/en](https://docs.ruby-lang.org/en/) (or [/en/master](https://docs.ruby-lang.org/en/master/) for trunk) rather than relying on memory. For RSpec/FactoryBot API specifics, check rspec.info / RubyDoc.info. The reference file below repeats the pointer relevant to its own domain.
