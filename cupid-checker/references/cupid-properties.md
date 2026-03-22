# CUPID Properties — Full Reference

Source: Dan North, "CUPID — for joyful coding" (https://dannorth.net/blog/cupid-for-joyful-coding/)

---

## C — Composable: plays well with others

Code that is easy to use gets used, reused, and composed with other code. Composability is about how well a piece of code fits into a larger whole.

### Sub-dimensions

**Small surface area**

- A narrow, opinionated API has less to learn, less to go wrong, and less chance of conflicts
- Too narrow is also a problem: if callers must always use APIs in groups to accomplish anything, "the right combination" becomes tacit knowledge
- Aim for "just right" cohesion — not fragmented, not bloated
- Ask: "Can I understand and use this API in 2 minutes? 10 minutes?"

**Intention-revealing**

- Easy to discover: can I find this component when I need it?
- Easy to assess: can I quickly tell if this is what I need, or not?
- Good names attract correct usage; they also make serendipitous discovery possible when others reach for similar names
- Code that is intention-revealing tends to also be domain-based

**Minimal dependencies**

- Fewer dependencies = less to worry about, fewer version conflicts, fewer transitive surprises
- Every dependency is a liability (version pinning, security patches, breaking changes)
- Ask: "Does this code pull in things it doesn't really need?"
- Especially important for libraries and shared code

---

## U — Unix Philosophy: does one thing well

Named after the design philosophy that made Unix the dominant OS on the planet. The core idea: small, focused components that work together through a consistent model.

### Sub-dimensions

**Does one thing well (single purpose)**

- Outside-in perspective: what is this _for_, from the caller's point of view?
- You should be able to describe the purpose in one clear sentence
- Different from SRP (Single Responsibility Principle): SRP is about internal organisation; Unix philosophy is about external purpose
- "Doing one thing" is not about lines of code — a complex algorithm that does one coherent thing is fine

**Works well with others (composability complement)**

- Outputs that can feed inputs of other components
- No surprising side effects that "reach out" beyond the stated purpose
- The Unix pipe metaphor: components in a chain, each doing its transformation

**Distinguishing from SRP**

- SRP says "one reason to change" — often leads to artificial seams (separate view/controller/model classes that always change together)
- Unix philosophy says "one _purpose_ from the outside" — allows natural cohesion to emerge
- When content and format of data change together (a new field, a data source change), Unix philosophy accepts they belong together; SRP would separate them
- Let domain-based structure guide _how_ to split things, not a priori rules

---

## P — Predictable: does what you expect

Code should do what it looks like it does, consistently and reliably, with no unpleasant surprises. Predictability is a generalisation of testability.

### Sub-dimensions

**Behaves as expected**

- The intended behaviour should be obvious from structure and naming — even without automated tests
- If you write characterization tests (Feathers), they should pass immediately
- Code that passes tests is table stakes; code whose _intended_ behaviour is obvious is higher
- Non-obvious code may be "technically correct" but still unpredictable

**Deterministic**

- Does the same thing every time given the same inputs and environment
- Even non-deterministic operations (random numbers, time-based logic) should have observable, bounded behaviour
- Three sub-properties:
  - **Robustness**: breadth of situations covered; limitations and edge cases are visible, not hidden
  - **Reliability**: acts as expected in covered situations; same result every time
  - **Resilience**: handles _unexpected_ inputs or environment gracefully, with clear failure modes

**Observable**

- Can you infer internal state from outputs? (control theory sense of observability)
- Observable code is _designed_ to be observable — it does not happen by accident
- Instrumentation maturity ladder:
  1. Instrumentation — software says what it's doing (logs, events)
  2. Telemetry — making that available (push/pull)
  3. Monitoring — receiving and displaying it
  4. Alerting — reacting to patterns
  5. Predicting — anticipating events
  6. Adapting — changing the system dynamically
- Most code never reaches step 1; aim for at least step 1 from the start

---

## I — Idiomatic: feels natural

Code should feel familiar to experienced practitioners of the language, its ecosystem, and the local team. Idiomatic code minimises extraneous cognitive load.

### Sub-dimensions

**Language idioms**

- Conforms to the standard conventions of the language community
- Examples:
  - Go: use `gofmt`, follow Effective Go, use built-in error handling patterns
  - Python: write "Pythonic" code (The Zen of Python: "one obvious way to do it")
  - JavaScript/TypeScript: consistent choice of paradigm (functional vs OO) and module patterns
- Multi-paradigm languages (JS, Scala, Ruby, Perl) risk having many styles in one codebase — pick one and be consistent
- The target audience knows the language well and is trying to get work done — don't make them learn your personal style

**Local idioms**

- When language has no consensus style, the team defines it
- Documented in: shared linter config, ADRs (Architecture Decision Records), style guides
- Consistent toolchain (formatter, linter, test runner, build tool) reduces friction
- Local idioms should be explicit and agreed, not implicit and assumed
- ADRs are a good mechanism: "We decided to use X because Y; alternatives considered: A, B"

**Cognitive load**

- Idiomatic code reduces extraneous cognitive load — the effort spent interpreting style choices rather than understanding the problem
- "Write code for future-you, who has forgotten all current context"
- Empathy is the greatest programming trait: for users, support, future developers

---

## D — Domain-based: solution domain models the problem domain

Code should convey what it does in the language and structure of the _problem domain_, not the technology domain. This minimises cognitive distance between need and solution.

### Sub-dimensions

**Domain-based language**

- Names types, functions, and variables after domain concepts, not technical constructs
  - ✅ `Surname`, `Money`, `OrderLineItem`, `ShippingAddress`
  - ❌ `string`, `float`, `HashMap`, `DatabaseConnection`
- Domain types can carry domain-specific constraints, operations, and validation
- Success criterion: observers cannot tell if a conversation is about the code or the domain
- The "financial analyst test": a domain expert should be able to read the code aloud and describe the business rules

**Domain-based structure**

- Directory layout and module organisation reflects the problem domain, not the framework
- Framework skeletons (Rails' `models/`, `views/`, `controllers/`) scatter a single domain concern across many directories
- Prefer top-level grouping by business capability / use case:
  - ✅ `patient_history/`, `appointments/`, `staffing/`, `compliance/`
  - ❌ `models/`, `views/`, `controllers/`, `helpers/`
- Any non-trivial change should be localised to one part of the domain structure, not scattered
- Domain structure reduces cognitive load and increases cohesion

**Domain-based boundaries**

- Module/package boundaries become domain boundaries
- Deployment becomes straightforward when everything needed for a component lives together
- Domain boundaries can align with deployment boundaries: monolith, microservices, or anything between
- Domains can contain subdomains; components can contain subcomponents — fractal at every level
- Aligning code boundaries with domain boundaries makes it easier to reason about, test, and deploy independently

---

## Properties of Properties

CUPID properties are designed to be:

- **Practical**: easy to articulate, easy to assess, easy to adopt incrementally
- **Human**: read from the perspective of people working with code, not abstract code metrics
- **Layered**: obvious at first glance, deep on further exploration

**Properties reinforce each other**: improving one typically improves others. Domain-based code tends to be more intention-revealing (Composable). Unix philosophy code tends to be more predictable. Idiomatic code tends to be more composable.

There is no "done" with CUPID — there is always a direction of travel.
