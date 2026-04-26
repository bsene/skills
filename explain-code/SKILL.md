---
name: explain-code
description: >
  Explains code with C4 model diagrams, analogies, and step-by-step walkthroughs. Use when explaining how code works,
  teaching about a codebase, onboarding to architecture, or when the user asks "how does this work?",
  "explain this system", "draw me a diagram", or "show me the architecture".
  DO NOT USE when: a one-sentence answer suffices — only invoke when an architecture overview, diagram,
  or step-by-step code walkthrough is the actual need.
---

# Explain Code

## Workflow

1. **Start with an analogy** — compare the code to something from everyday life
2. **Pick the right C4 level** — match diagram depth to the question (see table below)
3. **Draw the diagram** — always Structurizr DSL → `references/c4-structurizr.md`
   After drawing: run rendering check (see **Rendering** section below)
4. **Walk through the code** — explain step-by-step what happens
5. **Highlight a gotcha** — what's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.

## C4 Level Selector

| Question type | C4 level | Diagram keyword |
|---|---|---|
| "What does this system do?" / "Who uses it?" | **Level 1 — Context** | `C4Context` |
| "What are the main services/apps/databases?" | **Level 2 — Container** | `C4Container` |
| "How is this service structured internally?" | **Level 3 — Component** | `C4Component` |
| "How does this specific class/module work?" | **Level 4 — Code** | No diagram — explain via code walkthrough (Structurizr has no class/method equivalent) |

**Default to Level 2 (Container)** — it covers most "explain this codebase" requests. Go to Level 1 for stakeholder overviews, Level 3 for deep dives into a single service.

## Diagram Rules

- Every element must have: **name**, **type** (Person/System/Container/Component), and **brief description**
- Containers and components must state their **technology** (e.g. "Node.js Express", "PostgreSQL")
- Every relationship must be labeled with **action + protocol** (e.g. "Reads events via gRPC", not just "Uses")
- Use `_Ext` suffix for external systems/containers outside your boundary
- Use `System_Boundary` / `Container_Boundary` to group related elements
- Keep diagrams under ~12 elements — split into multiple diagrams if larger

## Rendering

Run in order, stop at first success:

1. **CLI available** — save DSL to `/tmp/<name>.dsl`, then:
   ```bash
   structurizr-cli export -workspace /tmp/<name>.dsl -format svg -output /tmp/structurizr-out/
   ```
   Share output path with user.

2. **Docker available** — save DSL to `/tmp/<name>.dsl`, give user:
   ```bash
   docker run -it --rm -p 8080:8080 -v /tmp:/usr/local/structurizr structurizr/lite
   ```
   Point to `http://localhost:8080`.

3. **Neither** — output DSL as a ` ```dsl ` code block. Note: paste at `https://structurizr.com/dsl` to render online.

---

→ Full Structurizr DSL syntax: `references/c4-structurizr.md`
