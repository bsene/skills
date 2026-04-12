# my-skills

A personal collection of Claude Code(also compatible) **skills** — specialized domain knowledge packs that enhance Claude's ability to assist with software engineering tasks. Each skill is a structured markdown document that teaches Claude deep expertise in a specific area, from testing and refactoring to version control and design patterns.

## What is a Skill?

A skill is a self-contained knowledge pack loaded into Claude Code. It provides:

- **Domain expertise**: specialized knowledge about a specific topic (e.g., BDD testing, Git workflows, OOP design)
- **Structured workflows**: step-by-step processes for applying that knowledge
- **Reference guides**: quick lookup tables, checklists, and examples

Skills are **auto-activated** in conversations — when you mention a topic that matches a skill's expertise area, Claude automatically applies that skill's knowledge and workflow. The activation trigger is defined in each skill's frontmatter via a `description` field that Claude uses to recognize when to invoke it.

### Example

When you ask "can you review my tests against BDD principles?", the `bdd-unit-test-reviewer` skill auto-activates and applies its 5-step BDD audit workflow.

## Skill Catalog

| Domain                    | Skill                        | Purpose                                                                                                   |
| ------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Strategy**              | `kano`                       | Kano model feature triage — classify and refuse unnecessary work before building                           |
| **Testing**               | `bdd-unit-test-reviewer`     | Audit unit tests against Dan North's BDD principles                                                       |
|                           | `testdesiderata`             | Review tests against Kent Beck's 12 TestDesiderata properties                                             |
|                           | `tcrdd`                      | Guide through TDD and TCRDD (Test-Commit-Revert + TDD) workflows                                          |
| **Refactoring**           | `refactoring`                | Detect and fix code bloaters (long methods, large classes, primitive obsession, etc.)                     |
|                           | `refactoring-patterns`       | Apply 7 active refactoring operations (Extract, Replace, Introduce, Simplify, Move, Rename)               |
|                           | `comments-smells`            | Detect and fix the "Comments" code smell                                                                  |
|                           | `mikado-method`              | Guide safe, incremental refactoring via Mikado graphs                                                     |
| **OOP Design**            | `oo-principles`              | Analyze OOP code against Dave Thomas's 7 principles                                                       |
|                           | `cupid-checker`              | Review code against Dan North's CUPID properties (Composable, Unix, Predictable, Idiomatic, Domain-based) |
|                           | `tell-dont-ask`              | Apply the Tell Don't Ask principle in OOP refactoring                                                     |
| **TypeScript/JavaScript** | `typescript`                 | Design patterns, SOLID principles, and TS5+ type system features                                          |
|                           | `typescript/design-patterns` | Classic GoF design patterns in modern JavaScript/TypeScript                                               |
|                           | `composing-software`         | Functional programming composition techniques in JavaScript                                               |
| **Databases/ORM**         | `drizzle-learner`            | Teaching code reviewer for Drizzle ORM + PostgreSQL                                                       |
| **Version Control**       | `git-hero`                   | Comprehensive Git mastery — best practices, expert Q&A, gitmoji, and CI/CD pipelines                     |
|                           | `git-hero/git-guru`          | Expert Git assistant (French and English) covering concepts, workflows, troubleshooting, and internals    |
|                           | `git-hero/gitmoji`           | Select and apply gitmoji emoji prefixes for commit messages, integrated with Conventional Commits         |
|                           | `git-hero/gitlab-dag`        | Design, write, review, and optimize GitLab CI/CD pipelines using DAG (`needs:`)                           |
| **Documentation**         | `markdown`                   | Comprehensive GitHub Flavored Markdown (GFM) reference                                                    |
|                           | `writing-a-good-claude-md`   | Write, review, and audit CLAUDE.md/AGENTS.md files for AI agents                                          |
| **Languages**             | `chicken-scheme`             | Write, compile, debug, and package CHICKEN Scheme programs                                                |

## How Skills Activate

Skills are **context-aware and automatic**:

1. When you describe a problem or ask a question, Claude recognizes relevant skills based on their activation triggers (the `description` field in frontmatter)
2. The matching skill's knowledge and workflow are applied automatically
3. No explicit commands or manual loading required

### Example Triggers

- _"My tests have bad names"_ → activates `bdd-unit-test-reviewer`
- _"I need to refactor this long method"_ → activates `refactoring-patterns`
- _"How do I rewrite a commit message?"_ → activates `git-guru`
- _"Help me optimize this CI/CD pipeline"_ → activates `gitlab-dag`

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

- **`skill-optimizer`** (from [mcollina/skills](https://github.com/mcollina/skills) on GitHub): Optimize skills for activation, clarity, and cross-model reliability

External skills are installed in `.agents/skills/` and pinned by commit hash in `skills-lock.json` for reproducibility.

---

**Last updated**: March 30, 2026
