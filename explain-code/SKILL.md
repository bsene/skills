---
name: explain-code
description: >
  Explains code with C4 model diagrams, analogies, and step-by-step walkthroughs. Use when explaining how code works,
  teaching about a codebase, onboarding to architecture, or when the user asks "how does this work?",
  "explain this system", "draw me a diagram", or "show me the architecture".
---

# Explain Code

## Workflow

1. **Start with an analogy** — compare the code to something from everyday life
2. **Pick the right C4 level** — match diagram depth to the question (see table below)
3. **Draw a Mermaid C4 diagram** — render using `references/c4-mermaid.md` syntax
4. **Walk through the code** — explain step-by-step what happens
5. **Highlight a gotcha** — what's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.

## C4 Level Selector

| Question type | C4 level | Diagram keyword |
|---|---|---|
| "What does this system do?" / "Who uses it?" | **Level 1 — Context** | `C4Context` |
| "What are the main services/apps/databases?" | **Level 2 — Container** | `C4Container` |
| "How is this service structured internally?" | **Level 3 — Component** | `C4Component` |
| "How does this specific class/module work?" | **Level 4 — Code** | Standard Mermaid (classDiagram, flowchart) |

**Default to Level 2 (Container)** — it covers most "explain this codebase" requests. Go to Level 1 for stakeholder overviews, Level 3 for deep dives into a single service.

## Diagram Rules

- Every element must have: **name**, **type** (Person/System/Container/Component), and **brief description**
- Containers and components must state their **technology** (e.g. "Node.js Express", "PostgreSQL")
- Every relationship must be labeled with **action + protocol** (e.g. "Reads events via gRPC", not just "Uses")
- Use `_Ext` suffix for external systems/containers outside your boundary
- Use `System_Boundary` / `Container_Boundary` to group related elements
- Keep diagrams under ~12 elements — split into multiple diagrams if larger

→ Full Mermaid C4 syntax reference: `references/c4-mermaid.md`
