# skills

Claude Code skill library — domain packs Claude activates on demand to bring deep expertise into any conversation.

## Why it exists

Claude is great at generic software help, bad at being an expert in one specific craft. Each skill loads a focused knowledge pack (workflow + reference) so Claude acts as a specialist when you need one — and gets out of the way otherwise.

**Install → describe your problem → get a tailored workflow.** No manual loading, no configuration.

## Available skills

| Why? | Skill | What it does in 7 words |
| --- | --- | --- |
| Should I build this? | [kano](/skills/kano/SKILL.md) | Classify features by user benefit, refuse waste |
| Test the right things | [testing](/skills/testing/SKILL.md) | Tiered testing philosophy, desiderata for any lang |
| Write smoke tests | [smoke-tests](/skills/smoke-tests/SKILL.md) | Identify + gate CI on critical-path validation |
| TDD rigorously | [tcrdd](/skills/tcrdd/SKILL.md) | Test-Commit-Revert workflows with test-first discipline |
| Fix code bloaters | [refactoring](/skills/refactoring/SKILL.md) | Detect long methods, large classes, primitive obsession |
| Safe incremental refactor | [mikado-method](/skills/mikado-method/SKILL.md) | Step by dependency graph to unblock the next move |
| OOP principles review | [oop-principles](/skills/oop-principles/SKILL.md) | Critique code against Dave Thomas's 7 principles |
| CUPID review | [cupid-checker](/skills/cupid-checker/SKILL.md) | Composable, Unixy, Predictable, Idiomatic, Domain-aligned |
| Hexagonal architecture | [ports-adapters-architecture](/skills/ports-adapters-architecture/SKILL.md) | Apply the hex pattern to domain boundaries |
| Plain JavaScript rules | [javascript](/skills/javascript/SKILL.md) | Name things right, handle `this`, avoid null traps |
| TypeScript mastery | [typescript](/skills/typescript/SKILL.md), [type-system](/skills/typescript/type-system), [zod](/skills/typescript/zod) | Strict types, error handling, runtime validation |
| Functional composition | [composing-software](/skills/composing-software/SKILL.md) | Pipe → compose → combine techniques in JS |
| Idiomatic Go | [golang](/skills/golang/SKILL.md), plus sub-skills | Project layout, error-handling, concurrency, generics, testing |
| CHICKEN Scheme | [chicken-scheme](/skills/chicken-scheme/SKILL.md) | Write / package / debug Scheme programs |
| Git as a craft | [git-hero](/skills/git-hero/SKILL.md), plus sub-skills | Atomic commits, gitmoji, CLI guru (FR / EN), GitLab DAG |
| REST API design | [rest-api-design](/skills/rest-api-design/SKILL.md) | URIs, verbs, pagination, errors, security, HATEOAS |
| System diagrams | [c4-diagram](/skills/c4-diagram/SKILL.md) + [explain-code](/skills/explain-code/SKILL.md) | C4 / Mermaid diagrams and code walkthroughs |
| Daily progress log | [logging-daily-progress](/skills/logging-daily-progress/SKILL.md) | Rolling commit-based impact / learnings report |

## Add a skill

1. Create `skill-name/SKILL.md` with frontmatter (`name`, `description`) and your core workflow
2. Commit — Claude will pick it up automatically

See [writing-a-good-claude-md](/skills/writing-a-good-claude-md/SKILL.md) for quality guidance and the router pattern (nested sub-skills).

---

**Built by**: [birrame](https://github.com/birrame) · **Last updated**: May 31, 2026
