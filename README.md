# my-skills

A personal collection of Claude Code(also compatible) **skills** — specialized domain knowledge packs that enhance Claude's ability to assist with software engineering tasks. Each skill is a structured markdown document that teaches Claude deep expertise in a specific area, from testing and refactoring to version control and design patterns.

## What is a Skill?

A skill is a self-contained knowledge pack loaded into Claude Code. It provides:

- **Domain expertise**: specialized knowledge about a specific topic (e.g., BDD testing, Git workflows, OOP design)
- **Structured workflows**: step-by-step processes for applying that knowledge
- **Reference guides**: quick lookup tables, checklists, and examples

Skills are **auto-activated** in conversations — when you mention a topic that matches a skill's expertise area, Claude automatically applies that skill's knowledge and workflow. The activation trigger is defined in each skill's frontmatter via a `description` field that Claude uses to recognize when to invoke it.

### Example

When you ask "is this feature worth building?", the `kano` skill auto-activates and applies its Kano-model triage workflow.

## Skill Catalog

| Domain                    | Skill                          | Purpose                                                                                                   |
| ------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Strategy**              | `kano`                         | Kano model feature triage — classify and refuse unnecessary work before building                          |
| **Testing**               | `testing`                      | Testing philosophy, hierarchy, and test desiderata for any language                                       |
|                           | `smoke-tests`                  | Identify, write, and gate CI on smoke tests — critical path validation with template                      |
|                           | `tcrdd`                        | Guide through TDD and TCRDD (Test-Commit-Revert + TDD) workflows                                          |
| **Refactoring**           | `refactoring`                  | Detect and fix code bloaters (long methods, large classes, primitive obsession, etc.)                     |
|                           | `mikado-method`                | Guide safe, incremental refactoring via Mikado dependency graphs                                          |
| **OOP & Architecture**    | `oop-principles`               | Analyze OOP code against Dave Thomas's 7 principles                                                       |
|                           | `cupid-checker`                | Review code against Dan North's CUPID properties (Composable, Unix, Predictable, Idiomatic, Domain-based) |
|                           | `ports-adapters-architecture`  | Apply Hexagonal / Ports-and-Adapters architecture                                                         |
| **TypeScript/JavaScript** | `typescript` *(router)*        | TypeScript best practices — error handling, strict mode, types/Zod sub-skills                             |
|                           | `typescript/type-system`       | TS5+ type system features                                                                                  |
|                           | `typescript/zod`               | Runtime validation with Zod                                                                                |
|                           | `composing-software`           | Functional programming composition techniques in JavaScript                                               |
| **Go**                    | `golang` *(router)*            | Idiomatic Go — project structure, fundamentals, naming, anti-patterns                                     |
|                           | `golang/error-handling`        | Error interface, custom types, wrapping, sentinel errors, panic/recover                                   |
|                           | `golang/concurrency`           | Goroutines, channels, select, sync primitives, context, errgroup                                          |
|                           | `golang/types-and-interfaces`  | Structs, interfaces, embedding, composition, generics, enums with iota                                    |
|                           | `golang/testing`               | Table-driven tests, benchmarks, fuzz testing, httptest, testify, profiling                                |
|                           | `golang/web`                   | HTTP server/client, handlers, middleware, JSON encoding, templates                                        |
|                           | `golang/packages-and-modules`  | go.mod, go.sum, versioning, proxies, workspaces, internal packages                                        |
| **Languages**             | `chicken-scheme`               | Write, compile, debug, and package CHICKEN Scheme programs                                                |
| **Version Control**       | `git-hero` *(router)*          | Git mastery — commit discipline, atomic commits, routes to sub-skills                                     |
|                           | `git-hero/git-guru`            | Expert Git assistant (French and English) covering concepts, workflows, troubleshooting, and internals    |
|                           | `git-hero/gitmoji`             | Select and apply gitmoji emoji prefixes for commit messages, integrated with Conventional Commits         |
|                           | `git-hero/gitlab-dag`          | Design, write, review, and optimize GitLab CI/CD pipelines using DAG (`needs:`)                           |
| **API Design**            | `rest-api-design`              | Design and review REST APIs — URIs, verbs, status codes, pagination, errors, security, HATEOAS           |
| **Diagrams & Docs**       | `c4-diagram`                   | Render C4 model architecture diagrams via Mermaid or Structurizr DSL                                      |
|                           | `explain-code`                 | Explain code with C4 diagrams, analogies, and step-by-step walkthroughs                                   |
|                           | `markdown`                     | Comprehensive GitHub Flavored Markdown (GFM) reference                                                    |
|                           | `writing-a-good-claude-md`     | Write, review, and audit CLAUDE.md/AGENTS.md files for AI agents                                          |
| **Workflow**              | `show-me-the-code`             | Strict diff-style protocol for any code change                                                            |
|                           | `logging-daily-progress`       | Maintain a rolling daily progress log (Impact / Learnings / Commits) sourced from git                     |

## How Skills Activate

Skills are **context-aware and automatic**:

1. When you describe a problem or ask a question, Claude recognizes relevant skills based on their activation triggers (the `description` field in frontmatter)
2. The matching skill's knowledge and workflow are applied automatically
3. No explicit commands or manual loading required

### Example Triggers

- _"Is this feature worth building?"_ → activates `kano`
- _"I need to refactor this long method"_ → activates `refactoring`
- _"How do I rewrite a commit message?"_ → activates `git-guru`
- _"Help me optimize this CI/CD pipeline"_ → activates `gitlab-dag`
- _"Walk me through how this service works"_ → activates `explain-code`

## Skill File Format

Each skill is a directory with a `SKILL.md` file. The file structure is consistent across all skills:

```markdown
---
name: my-skill
description: phrases and synonyms that trigger this skill in conversation
---

# My Skill

[Core workflow, reference sections, examples, and code samples in Markdown]
```

### Key Components

- **Frontmatter** (`name` and `description`): YAML metadata. The `description` is critical — it lists phrases, synonyms, and casual language that Claude uses to recognize when to activate the skill in a conversation
- **Workflow sections**: Step-by-step processes, quick reference tables, decision guides
- **Code examples**: Language-tagged examples demonstrating patterns
- **Progressive disclosure**: Optional `references/` sub-directory for deeper reference material, kept separate to save token cost

### Optional Structure

Skills may include a `references/` sub-directory for detailed reference docs (not loaded by default, but linked from the main `SKILL.md`):

```
my-skill/
├── SKILL.md                  # Main skill file
└── references/
    ├── advanced-guide.md     # Deeper topics
    ├── patterns.md           # Pattern reference
    └── checklist.md          # Review checklist
```

### Router Skills

Some skills act as **routers**: their main `SKILL.md` is a thin dispatcher to nested sub-skills, each living in its own sub-directory with its own `SKILL.md`. Routers in this repo: `typescript`, `golang`, `git-hero`.

A router's frontmatter sets `user-invocable: false` so Claude does not stop at the dispatcher when the user actually wants a sub-skill. Sub-skills are activated by their own descriptions (e.g. asking about Goroutines activates `golang/concurrency` directly).

```
typescript/
├── SKILL.md                  # Router (user-invocable: false)
├── rules/                    # Always-on rules surfaced from main file
├── type-system/SKILL.md      # Sub-skill
└── zod/SKILL.md              # Sub-skill
```

## Adding a New Skill

1. **Create a directory** in the root: `skills/my-new-skill/`
2. **Write `SKILL.md`** with:
   - Frontmatter (`name` and a detailed `description`)
   - An H1 heading with the skill name
   - Core workflow, reference sections, and examples
3. **Optionally add** `references/` sub-docs for complex topics
4. **Test activation** by describing a scenario that should trigger your skill

### Quality Guidance

- Use the `writing-a-good-claude-md` skill to audit the skill's clarity and completeness
- Use the `skill-optimizer` skill to refine activation triggers and token efficiency
- Keep the `description` field rich with synonyms, casual language, and edge cases so Claude reliably recognizes when to invoke it

## External Skills

This repo uses `skills-lock.json` to track externally sourced skills. One external skill is currently installed:

- **`skill-optimizer`** (from [mcollina/skills](https://github.com/mcollina/skills) on GitHub): Optimize skills for activation, clarity, and cross-model reliability.

External skills are installed in `.agents/skills/` and pinned by commit hash in `skills-lock.json` for reproducibility.

---

**Last updated**: May 5, 2026
