# Lists & Tasks

## Lists

**Unordered** — use `-`, `*`, or `+`:
```markdown
- Item one
- Item two
- Item three
```

**Ordered:**
```markdown
1. First
2. Second
3. Third
```

**Nested lists** — indent child items so the marker aligns under the first character of the parent item's text:
```markdown
1. First item
   - Nested item
     - Deeply nested item
```

---

## Task Lists

Use `- [ ]` for incomplete and `- [x]` for complete tasks. Renders as interactive checkboxes in issues and PRs.

```markdown
- [x] Write tests
- [ ] Update documentation
- [ ] Deploy to production
```

Escape an opening parenthesis when an item starts with one:
```markdown
- [ ] \(Optional) Open a follow-up issue
```
