---
id: clean-code-001-agent-code-review
skill: clean-code
---

# Prompt

This function was written by our AI coding agent, and the same agent will keep maintaining this module going forward (humans only glance at it). Give me a clean-code review: what's wrong, concretely, and how to fix it.

```js
// process the order and send the confirmation email
function procOrdData(o, u) {
  // check status
  let r = [];
  if (o.st == "new" && u.tier == "vip") {
    r.push("fast-lane");
  } else if (o.st == "new") {
    r.push("normal-lane");
  } else if (o.st == "pending" && o.days > 3) {
    r.push("chase");
  } else if (o.st == "shipped") {
    r.push("closed");
  } else {
    r.push("review");
  }
  // loop over the items
  for (const i of o.items) {
    if (i.qty > 10 && u.tier == "vip") {
      r.push("bulk-vip");
    }
  }
  return r;
}
```

# Criteria

- [ ] Assesses cyclomatic complexity with a concrete count (roughly 9-11 with this function) and judges it against the agent-code budget of ≤ 6 — not the human budget of ≤ 4
- [ ] Prescribes a specific refactor move from the skill's preference order (guard clauses, extract method, replace conditional with map lookup, or split the function), not just "reduce complexity"
- [ ] Flags the naming per the rules: abbreviation/noise-word name `procOrdData`, non-descriptive short names (`o`, `u`, `r`, `st`), and proposes intention-revealing replacements
- [ ] Identifies the comments as failures: `// process the order...` is stale (no email is sent — flag for deletion) and `// check status` / `// loop over the items` merely restate the code
- [ ] Review does NOT demand a contorted refactor purely to hit the budget number, and does NOT apply the human ≤ 4 budget to this agent-maintained code
- [ ] Review does NOT recommend adding explanatory comments to rescue the bad names/branches instead of renaming and extracting
