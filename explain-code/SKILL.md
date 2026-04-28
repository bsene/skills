---
name: explain-code
description: >
  Explains code with C4 model diagrams, analogies, and step-by-step walkthroughs. Use when explaining how code works,
  teaching about a codebase, onboarding to architecture, or when the user asks "how does this work?",
  "explain this system", or "show me the architecture".
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
