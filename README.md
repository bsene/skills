# skills

A coding-agent skill library — domain expertise packs that load on demand for any compatible assistant.

## Why it exists

Every coding assistant is broad by default; to be sharp on a specific craft you ship a focused knowledge pack into a shared location the host reads from. When your prompt touches the right topic, the matching skill activates automatically.

**Install → describe your problem → get a tailored workflow.** No manual loading, no configuration.

## Available skills

| Why?                            | Skill                                                                                                                                                                  | What it does in 7 words                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Should I build this?            | [kano](/skills/kano/SKILL.md)                                                                                                                                          | Classify features by user benefit, refuse waste                                           |
| Apply Lean to software delivery | [lean-sensei](/skills/lean-sensei/SKILL.md)                                                                                                                            | Improve flow, adapt coaching, encourage design discovery                                  |
| Build with hacker ethos         | [hacker-manifesto](/skills/hacker-manifesto/SKILL.md)                                                                                                                  | Solve, share, automate drudgery, earn competence                                          |
| Readability and CUPID review    | [clean-code](/skills/clean-code/SKILL.md)                                                                                                                              | Human-scale design, naming, complexity, comments, CUPID                                   |
| Review the diff                 | [review](/skills/review/SKILL.md)                                                                                                                                      | Review current diff, evidence, risk, and approved fixes                                  |
| Mine review feedback            | [fetch-pr-corpus](/skills/fetch-pr-corpus/SKILL.md)                                                                                                                    | Fetch merged-PR review corpus as JSONL for style mining                                   |
| Show changes as diffs           | [show-me-the-code](/skills/show-me-the-code/SKILL.md)                                                                                                                  | Show unified diffs when explicitly requested                                               |
| Ship with human ownership       | [code-ownership](/skills/code-ownership/SKILL.md)                                                                                                                      | Confirm intent, validation, and approval before shipping                                  |
| Root-cause a defect             | [dantotsu](/skills/dantotsu/SKILL.md)                                                                                                                                  | Contain defects, investigate causes, verify prevention measures                            |
| Test the right things           | [testing](/skills/testing/SKILL.md)                                                                                                                                    | Test portfolio, flakiness, mocks, BDD, AI                                                 |
| Clarify a BDD story             | [example-mapping](/skills/example-mapping/SKILL.md)                                                                                                                    | Map rules, examples, questions, and scope before development                              |
| Write smoke tests               | [smoke-tests](/skills/smoke-tests/SKILL.md)                                                                                                                            | Identify + gate CI on critical-path validation                                            |
| TDD rigorously                  | [tcrdd](/skills/tcrdd/SKILL.md)                                                                                                                                        | Test-first loop; on-demand git-cycle, autonomy and exception references                                   |
| Refactor cleanly                | [clean-code → refactoring](/skills/clean-code/refactoring/SKILL.md)                                                                                                    | Tidy just in time; detect long methods, large classes, primitive obsession                |
| Safe incremental refactor       | [mikado-method](/skills/mikado-method/SKILL.md)                                                                                                                        | Step by dependency graph to unblock the next move                                         |
| OOP principles review           | [object-oriented-programming](/skills/object-oriented-programming/SKILL.md)                                                                                            | SOLID, GoF patterns, calisthenics, tell-don't-ask                                         |
| Architecture boundaries         | [the-architect](/skills/the-architect/SKILL.md)                                                                                                                        | Choose clean, hexagonal, or functional-core boundaries                                    |
| JavaScript & TypeScript mastery | [typescript](/skills/typescript/SKILL.md), [type-system](/skills/typescript/type-system), [zod](/skills/typescript/zod), [composition](/skills/typescript/composition), [Deno guidance](/skills/typescript/references/deno.md) | Strict types, JS idioms, runtime validation, Deno; FP techniques loaded on demand |
| Lisp, Clojure & CHICKEN Scheme   | [lisper](/skills/lisper/SKILL.md)                                                                                                                                      | Lisp dialects, Clojure/CLJS idioms, CHICKEN tooling, interop                                |
| Idiomatic Go                    | [golang](/skills/golang/SKILL.md), [golang-testing](/skills/golang/testing/SKILL.md), plus sub-skills                                                                   | Project layout, error-handling, concurrency, generics, testing                            |
| Idiomatic Ruby / Rails          | [ruby](/skills/ruby/SKILL.md)                                                                                                                                          | Style, GoF patterns, RSpec/Minitest testing                                               |
| Verify PHP against php.net      | [php](/skills/php/SKILL.md)                                                                                                                                            | Check signatures, edge returns, PHP 8 removals                                            |
| OCaml                           | [ocaml](/skills/ocaml/SKILL.md)                                                                                                                                        | OCaml/dune; extracted guidance on invariants, collections, memoization, and graphs         |
| Expert C++                      | [cpp-expert](/skills/cpp-expert/SKILL.md)                                                                                                                              | Value semantics, pointers/references, C foundations and interoperability                  |
| C programming                   | [c-programming](/skills/c-programming/SKILL.md)                                                                                                                        | C ownership, buffers, error handling, and compiler checks                                 |
| ReScript                        | [rescript](/skills/rescript/SKILL.md)                                                                                                                                  | Write/debug ReScript, JSX v4, JS interop                                                  |
| Git as a craft                  | [git-hero](/skills/git-hero/SKILL.md), plus sub-skills                                                                                                                 | Git help (FR / EN), atomic commits, Gitmoji, GitLab DAG |
| REST API design                 | [rest-api-design](/skills/rest-api-design/SKILL.md)                                                                                                                    | Core API decisions; on-demand response, collection and reliability references                                        |
| System diagrams                 | [c4-diagram](/skills/c4-diagram/SKILL.md) + [explain-code](/skills/explain-code/SKILL.md)                                                                              | C4 / Mermaid diagrams and code walkthroughs                                               |
| Markdown authoring              | [markdown](/skills/markdown/SKILL.md)                                                                                                                                  | GitHub-Flavored Markdown syntax reference                                                 |
| Sharpen communication           | [communication](/skills/communication/SKILL.md)                                                                                                                        | Analyze artifacts; apply rhetoric and author voice presets                                |
| Communicate in an author voice  | [communication → presets](/skills/communication/references/authors/)                                                                                                   | DHH, Uncle Bob, Jessitron, and Martin Fowler presets                                      |
| Daily progress log              | [logging-daily-progress](/skills/logging-daily-progress/SKILL.md)                                                                                                      | Rolling commit-based impact / learnings report                                            |
| Write AGENTS.md well            | [writing-a-good-agents-md](/skills/writing-a-good-agents-md/SKILL.md)                                                                                                  | Author/audit agent context files (AGENTS.md, CLAUDE.md…)                                  |
| Write a README                  | [writing-a-readme](/skills/writing-a-readme/SKILL.md)                                                                                                                  | Draft a clear, accurate project or profile README                                         |
| Ground on real library source   | [vendor-reference](/skills/vendor-reference/SKILL.md)                                                                                                                  | Vendor library gitignored, read source, never commit                                      |
| Write idiomatic systems Rust    | [rust](/skills/rust/SKILL.md)                                                                                                                                          | Ownership, errors, traits, concurrency, unsafe, cargo                                     |
| Idiomatic modern Java / AspectJ | [java](/skills/java/SKILL.md)                                                                                                                                          | Effective Java themes, records, streams, concurrency, AspectJ                             |
| Design data-intensive systems   | [data-systems](/skills/data-systems/SKILL.md)                                                                                                                          | Data models, replication, transactions, streams, database choice                          |
| Idiomatic Elixir / OTP          | [elixir](/skills/elixir/SKILL.md)                                                                                                                                      | Pattern matching, pipelines, OTP supervision, Mix, ExUnit                                 |

Install `lisper` for the complete Lisp package, including CHICKEN Scheme's compiler, eggs, FFI, and deployment references. Dialect-specific guidance loads on demand; no separate CHICKEN skill is required.

The TypeScript skill follows each project's configured runtime, imports, tests, and verification workflow.
Its [Total TypeScript reference](typescript/references/total-typescript.md) adds guidance from Matt Pocock's public material on type derivation, `satisfies`, generic inference, conditional types, and type tests.
For Effect TS, the skill links to the [official documentation](https://effect.website/docs/) and directs agents to match the installed library version.
See [.benchmarks/README.md](.benchmarks/README.md) for instruction-uptake benchmarks and their limits.

## Add a skill

1. Create `skill-name/SKILL.md` with frontmatter (`name`, `description`) and your core workflow
2. Push to a shared repo the assistant reads from

See [writing-a-good-agents-md](/skills/writing-a-good-agents-md/SKILL.md) for quality guidance and the router pattern (nested sub-skills).

---

**Built by**: [birrame](https://github.com/birrame) · **Last updated**: Sep 23, 2026
