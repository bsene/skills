# skills

A coding-agent skill library — domain expertise packs that load on demand for any compatible assistant.

## Why it exists

Every coding assistant is broad by default; to be sharp on a specific craft you ship a focused knowledge pack into a shared location the host reads from. When your prompt touches the right topic, the matching skill activates automatically.

**Install → describe your problem → get a tailored workflow.** No manual loading, no configuration.

## Available skills

| Why? | Skill | What it does in 7 words |
| --- | --- | --- |
| Should I build this? | [kano](/skills/kano/SKILL.md) | Classify features by user benefit, refuse waste |
| Keep it simple | [simple](/skills/simple/SKILL.md) | Refuse complexity; code for human affordance |
| Readability pass | [clean-code](/skills/clean-code/SKILL.md) | Naming, complexity budgets, comment discipline |
| Review the diff | [review](/skills/review/SKILL.md) | Read actual diff, tier feedback, apply fixes |
| Show changes as diffs | [show-me-the-code](/skills/show-me-the-code/SKILL.md) | Every code change as a unified diff |
| Root-cause a defect | [dantotsu](/skills/dantotsu/SKILL.md) | Turn one defect into permanent quality gain |
| Test the right things | [testing](/skills/testing/SKILL.md) | Tiered testing philosophy, desiderata for any lang |
| Write smoke tests | [smoke-tests](/skills/smoke-tests/SKILL.md) | Identify + gate CI on critical-path validation |
| TDD rigorously | [tcrdd](/skills/tcrdd/SKILL.md) | Test-Commit-Revert workflows with test-first discipline |
| Fix code bloaters | [refactoring](/skills/refactoring/SKILL.md) | Detect long methods, large classes, primitive obsession |
| Safe incremental refactor | [mikado-method](/skills/mikado-method/SKILL.md) | Step by dependency graph to unblock the next move |
| OOP principles review | [object-oriented-programming](/skills/object-oriented-programming/SKILL.md) | SOLID, GoF patterns, calisthenics, tell-don't-ask |
| CUPID review | [cupid-checker](/skills/cupid-checker/SKILL.md) | Composable, Unixy, Predictable, Idiomatic, Domain-aligned |
| Hexagonal architecture | [ports-adapters-architecture](/skills/ports-adapters-architecture/SKILL.md) | Apply the hex pattern to domain boundaries |
| JavaScript & TypeScript mastery | [typescript](/skills/typescript/SKILL.md), [type-system](/skills/typescript/type-system), [zod](/skills/typescript/zod), [composition](/skills/typescript/composition) | Strict types, JS idioms, FP composition, runtime validation |
| ClojureScript | [clojurescript](/skills/clojurescript/SKILL.md) | Write/debug/configure CLJS + JS interop |
| Monoid abstraction | [monoids](/skills/monoids/SKILL.md) | Recognize/apply monoids in TS and CLJS |
| Idiomatic Go | [golang](/skills/golang/SKILL.md), plus sub-skills | Project layout, error-handling, concurrency, generics, testing |
| Idiomatic Ruby / Rails | [ruby](/skills/ruby/SKILL.md) | Style, GoF patterns, RSpec/Minitest testing |
| CHICKEN Scheme | [chicken-scheme](/skills/chicken-scheme/SKILL.md) | Write / package / debug Scheme programs |
| OCaml | [ocaml](/skills/ocaml/SKILL.md) | Write/review/debug OCaml and dune projects |
| ReScript | [rescript](/skills/rescript/SKILL.md) | Write/debug ReScript, JSX v4, JS interop |
| Git as a craft | [git-hero](/skills/git-hero/SKILL.md), plus sub-skills | Atomic commits, gitmoji, CLI guru (FR / EN), GitLab DAG |
| REST API design | [rest-api-design](/skills/rest-api-design/SKILL.md) | URIs, verbs, pagination, errors, security, HATEOAS |
| System diagrams | [c4-diagram](/skills/c4-diagram/SKILL.md) + [explain-code](/skills/explain-code/SKILL.md) | C4 / Mermaid diagrams and code walkthroughs |
| Markdown authoring | [markdown](/skills/markdown/SKILL.md) | GitHub-Flavored Markdown syntax reference |
| Sharpen communication | [communication](/skills/communication/SKILL.md) | Analyze and rewrite real messages/emails/transcripts |
| Daily progress log | [logging-daily-progress](/skills/logging-daily-progress/SKILL.md) | Rolling commit-based impact / learnings report |
| Write AGENTS.md well | [writing-a-good-agents-md](/skills/writing-a-good-agents-md/SKILL.md) | Author/audit agent context files (AGENTS.md, CLAUDE.md…) |

## Add a skill

1. Create `skill-name/SKILL.md` with frontmatter (`name`, `description`) and your core workflow
2. Push to a shared repo the assistant reads from

See [writing-a-good-agents-md](/skills/writing-a-good-agents-md/SKILL.md) for quality guidance and the router pattern (nested sub-skills).

---

**Built by**: [birrame](https://github.com/birrame) · **Last updated**: Aug 29, 2026
