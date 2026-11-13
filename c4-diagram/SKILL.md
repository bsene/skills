---
name: c4-diagram
description: >
  Generates C4 model architecture diagrams using Structurizr DSL (primary) or Mermaid C4 (fallback).
  Use when: user asks to "draw a diagram", "create a C4 diagram", "show architecture as a diagram",
  "generate architecture diagram", "document the system".
  DO NOT USE for code explanation or walkthroughs (use `explain-code`), class/sequence/ER diagrams
  (C4 is system-architecture only), or when a diagram is incidental to a code change — only when
  a C4 diagram is the primary deliverable.
---

# C4 Diagram

## Workflow

1. **Pick the C4 level** — match diagram depth to the question (see table below)
2. **Choose the tool** — Structurizr DSL by default; Mermaid for quick inline previews (see table below)
3. **Generate the diagram** — follow Diagram Rules, then the DSL reference for the chosen tool
4. **Render** — follow the Rendering fallback chain

## C4 Level Selector

| Question type                                | C4 level                          | Structurizr view type                             |
| -------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| "Show the whole organisation / all systems"  | **Supporting — System Landscape** | `systemLandscape` (no Mermaid equivalent)         |
| "What does this system do?" / "Who uses it?" | **Level 1 — Context**             | `systemContext`                                   |
| "What are the main services/apps/databases?" | **Level 2 — Container**           | `container`                                       |
| "How is this service structured internally?" | **Level 3 — Component**           | `component`                                       |
| "How does this specific class/module work?"  | **Level 4 — Code**                | No diagram — Level 4 has no C4 diagram equivalent |

**Default to Level 2 (Container)** — it covers most "show me the architecture" requests. Level 1 for stakeholder overviews, Level 3 for deep dives into a single service.

## Tool Selector

| Need                                | Use                                                |
| ----------------------------------- | -------------------------------------------------- |
| Quick inline preview in chat        | Mermaid → `references/c4-mermaid.md`               |
| Export PNG/SVG for docs/wiki        | Structurizr → `references/c4-structurizr.md`       |
| Multiple views from one model       | Structurizr                                        |
| Organisation-wide system landscape  | Structurizr (no Mermaid C4 equivalent)             |
| Dynamic / numbered interaction flow | Either (`C4Dynamic` or Structurizr `dynamic`)      |
| Deployment / infrastructure view    | Structurizr (Mermaid `C4Deployment` is limited)    |
| Class/method level detail (Level 4) | Mermaid `classDiagram` — no Structurizr equivalent |
| No tooling available                | Mermaid                                            |

**Default to Structurizr DSL** unless the user explicitly wants a quick Mermaid preview.

## Diagram Rules

- Every element must have: **name**, **type** (Person/System/Container/Component), and **brief description**
- Containers and components must state their **technology** (e.g. "Node.js Express", "PostgreSQL")
- Every relationship must be labeled with **action + protocol** (e.g. "Reads events via gRPC", not just "Uses")
- Mark external systems/people with `tags "External"` in the model
- Boundaries are implicit: `systemContext` and `container` views auto-scope. Use `group` for logical sub-groupings within a boundary
- Keep diagrams under ~12 elements — split into multiple diagrams if larger

## Rendering

Run in order, stop at first success. Structurizr is one tool now: `structurizr.war` (Java 21) or the `structurizr/structurizr` Docker image. `structurizr.sh`, `structurizr-cli`, `structurizr/lite` and `structurizr/cli` are end of life — never emit them. Always save the DSL as `/tmp/<name>/workspace.dsl` (`local` mode only loads a file named `workspace.dsl`). Native `png`/`svg` export needs the preview `.war` plus Playwright and is not in the Docker image, so export to PlantUML or Mermaid and render with that tool.

1. **Java 21 + `structurizr.war`** (`curl -O https://download.structurizr.com/structurizr.war`):

   ```bash
   java -jar structurizr.war export -workspace /tmp/<name>/workspace.dsl -format plantuml -output /tmp/<name>/out
   plantuml -tsvg /tmp/<name>/out/*.puml
   ```

   Share output path with user.

2. **Docker available** — export, or give the user the interactive viewer:

   ```bash
   docker run --rm -v /tmp/<name>:/usr/local/structurizr structurizr/structurizr export -workspace workspace.dsl -format plantuml -output out
   docker run -it --rm -p 8080:8080 -v /tmp/<name>:/usr/local/structurizr structurizr/structurizr local
   ```

   For `local`, point to `http://localhost:8080`.

3. **Neither** — output DSL in a fenced `dsl` code block. Note: paste at `https://playground.structurizr.com/` to render online.

---

→ Structurizr DSL syntax: `references/c4-structurizr.md`
→ Mermaid C4 syntax: `references/c4-mermaid.md`

---

## Benchmark

Scenario: `.benchmarks/scenarios/c4-diagram-001-container-view.md` · Run: 2026-08-31 · Log: `.benchmarks/runs/2026-08-31/c4-diagram-001-container-view.json`

| Model             | Without | With | Delta |
| ----------------- | ------- | ---- | ----- |
| claude-opus-4-8   | 67%     | 100% | +33%  |
| claude-sonnet-4-6 | 100%    | 100% | +0%   |
| claude-haiku-4-5  | 100%    | 100% | +0%   |

> **PASS (run 2026-08-31)**. Opus +33 (67→100); sonnet/haiku already at ceiling. No regressions. Gate per `.agents/skills/skill-optimizer/rules/release-gates.md`.
