# Ruby & Rails Testing

Scope: how to structure the test itself — RSpec/Minitest conventions, what layer of the test pyramid a given behavior belongs in, and how to keep a Rails test suite fast and honest. This is about test *structure*, not the TDD discipline of test-first commit workflow (that's a separate concern — if the person already has a TCR-style skill for that, defer to it and stay focused on what goes inside the test file).

## Picking the right layer first

Before writing a test, place it correctly — most flaky/slow suites come from testing the wrong layer, not from bad assertions.

| What's being verified | Right layer | Wrong layer to avoid |
|---|---|---|
| A model's validation, scope, or business logic method | Model spec, no Rails request cycle | System spec (too slow for this) |
| A plain Ruby object's behavior (service, form object, PORO) | Plain RSpec example group, `require "spec_helper"` only — no `rails_helper` | Model spec (drags in ActiveRecord/DB for no reason) |
| An API endpoint's response shape/status codes | Request spec | Controller spec (deprecated pattern in modern Rails testing guidance) |
| A full user flow through the browser (JS included) | System spec (Capybara) | Feature-testing everything (slow — reserve for the handful of critical flows) |
| A background job's side effects | Job spec — assert enqueued (`have_enqueued_job`) in the caller's spec, test the job body directly in the job's own spec | Testing job execution indirectly through a request spec |

Rule of thumb worth stating directly when reviewing a suite: **push tests as far down the pyramid as they'll go.** A model-level test that exercises the same logic as a slow system test should replace it, not supplement it.

## RSpec structure

```ruby
RSpec.describe Invoice do
  subject(:invoice) { described_class.new(amount:, due_date:) }

  let(:amount) { 100 }
  let(:due_date) { Date.tomorrow }

  describe "#overdue?" do
    context "when due_date is in the past" do
      let(:due_date) { Date.yesterday }
      it { is_expected.to be_overdue }
    end

    context "when due_date is today or future" do
      it { is_expected.not_to be_overdue }
    end
  end
end
```

- `describe` the class/method under test; `context` the state/condition being varied. If a `context` block doesn't start with "when"/"with"/"given," it's probably actually a `describe`.
- `subject`/`let` are lazy — the block doesn't run until referenced. Use `let!` only when the side effect (usually a DB record) must exist before the example body runs, e.g. for scope/query tests. Overuse of `let!` is a common source of slow suites (unnecessary DB writes in examples that don't need them) — flag this in review.
- One assertion concept per `it`, but that can mean multiple `expect` calls if they're testing the same concept (e.g., several attributes of one resulting object). Splitting closely-related assertions into many tiny `it`s just to satisfy "one expectation per test" adds noise without adding safety.
- Prefer `described_class` over hardcoding the class name — keeps the spec resilient to renames and makes `subject` copy-pasteable across specs.

## Doubles, mocks, and when to use a real object instead

- **Verifying double (`instance_double(User)`) over a plain `double`** whenever the real class is loaded and available — a plain double will happily let you stub a method that doesn't exist on the real object, and the test passes while production code is already broken.
- **Stub what you don't own, use the real object for what you do.** Mocking a third-party API client is correct (you don't control its behavior, and hitting the real network in tests is slow/flaky). Mocking your own PORO collaborator is usually a sign the two objects should just be tested together, or that the collaborator's public interface is worth trusting rather than re-verifying at every call site.
- **`expect(...).to receive(...)` asserts an interaction happened; `allow(...).to receive(...)` just stubs a return value without asserting it was called.** Using `expect` when only a stub was needed makes the test brittle to unrelated implementation changes — default to `allow` unless the *fact that the call happened* is the actual thing under test.
- **Don't mock the object under test.** If a spec is stubbing methods on `subject` itself, the test is checking that Ruby method dispatch works, not that the class behaves correctly.

## Test data: factories vs. fixtures

- **FactoryBot factories** for anything that needs varying attributes across tests — the default choice for most Rails apps.
  ```ruby
  factory :invoice do
    amount { 100 }
    due_date { 1.day.from_now }
    association :customer
  end
  ```
  Keep factories minimal and valid by default; push edge-case attributes into `trait`s (`trait :overdue { due_date { 1.day.ago } }`) rather than creating a proliferation of near-duplicate factories.
- **Fixtures** are faster (loaded once per suite run, not per example) and still the right call for large, mostly-static reference data (a country list, a fixed set of permission levels) that every test can share unchanged.
- Avoid `create` when `build` or `build_stubbed` suffices — every unnecessary `create` is a real DB write, and it compounds fast in a large suite. Reach for `create` only when the object genuinely needs a persisted ID or must be queryable through the database in that example.

## Rails-specific traps

- **Time-dependent tests** should freeze time (`travel_to`/`freeze_time` from ActiveSupport::Testing::TimeHelpers) rather than asserting against `Time.now` computed separately in the test — the classic flaky test born from a millisecond gap between two `Time.now` calls.
- **`before(:each)` blocks that grow long** are a sign the setup belongs in a factory trait or a `let`, not procedural setup code — keeps the spec declarative and lets RSpec's laziness do its job.
- **Shared examples** (`RSpec.shared_examples "a paginated resource"`) are worth it once the same behavioral contract needs verifying across 3+ classes (e.g., every model that includes a `Sortable` concern) — before that threshold, duplication in the spec is more readable than the indirection of a shared example.
- **N+1s show up in tests before production if the suite asserts query counts** — this is a case where explicit test coverage (`expect { subject }.to make_database_queries(count: 1)` style assertions, e.g. via the `n_plus_one_control` or `bullet` gems) catches performance regressions test-first rather than after a slow production endpoint.

## TDD loop, briefly

Red → green → refactor, applied at the layer identified above:
1. Write the smallest failing example that states the next piece of behavior in business language (the `it` description should be readable as a sentence to someone who doesn't know the implementation).
2. Write the minimum production code to pass it — resist implementing behavior the current example doesn't demand yet.
3. Refactor with the safety net of the passing suite; re-run before moving to the next example.

If the person already has a workflow-level discipline for enforcing this (test-first commit gating, revert-on-red), this skill stays out of that lane and focuses on what the test itself should look like once written.

## Authoritative reference

For RSpec/Minitest API details beyond what's in this file, check the gem's own docs (rspec.info, RubyDoc.info for `rspec-core`/`rspec-mocks`/`factory_bot`) rather than relying on memory — matcher and API surfaces change across major versions. For core Ruby behavior underlying a test (e.g. `Comparable`, `Enumerable`, `Time`/`Date` semantics), the official Ruby reference manual at [docs.ruby-lang.org/en](https://docs.ruby-lang.org/en/) is the source of truth.
