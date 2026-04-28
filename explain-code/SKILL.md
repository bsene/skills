---
name: explain-code
description: >
  Explains code with C4 model diagrams, analogies, and step-by-step walkthroughs. Use when explaining how code works,
  teaching about a codebase, onboarding to architecture, or when the user asks "how does this work?",
  "explain this system", "walk me through this", "what does this code do?", "help me understand this",
  "show me the architecture", "explain this service", "how is this structured?", "trace the flow",
  "what happens when X calls Y?", or is new to a codebase and needs orientation.
  DO NOT USE when: a one-sentence answer suffices — only invoke when an architecture overview, diagram,
  or step-by-step code walkthrough is the actual need.
---

# Explain Code

## Workflow

1. **Start with an analogy** — compare the code to something from everyday life
2. **Pick the right C4 level** — match diagram depth to the question; default Level 2 (Container)
3. **Draw the diagram** — use the `c4-diagram` skill (level selector, DSL rules, rendering all live there)
4. **Walk through the code** — explain step-by-step what happens
5. **Highlight a gotcha** — what's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.

## Example output shape

> **Analogy:** This auth service is like a bouncer at a club — it checks your ID (token) before letting you into any room (endpoint).
>
> *(C4 Container diagram here — generated via `c4-diagram` skill)*
>
> **Walkthrough:** Request arrives at the HTTP adapter → `AuthMiddleware` validates the JWT → decoded claims passed to `UserService.resolve()` → user record returned or `UnauthorizedError` thrown.
>
> **Gotcha:** `AuthMiddleware` is stateless but relies on `TokenCache` — if cache is cold, every request hits the DB.
