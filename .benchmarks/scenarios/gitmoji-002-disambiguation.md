---
id: gitmoji-002-disambiguation
skill: git-hero-gitmoji
---

# Prompt

Give me the single most precise gitmoji + Conventional Commits subject line for EACH of
these four changes. One line each, and use the most specific emoji, not a generic default.

1. I deleted a block of code that was unreachable after an earlier refactor — pure dead-code removal.
2. I reformatted a file (indentation, import ordering, whitespace) with zero behavior change.
3. I rewrote the internal logic of a function to be cleaner — same inputs/outputs, behavior unchanged.
4. I added the `lodash` package as a new dependency to package.json.

# Criteria

- [ ] Change 1 (dead code) uses ⚰️ `:coffin:` (dead-code specific), NOT the generic 🔥 `:fire:`
- [ ] Change 2 (pure formatting) uses 🎨 `:art:` (cosmetic), NOT ♻️ `:recycle:`
- [ ] Change 3 (logic rewrite, same behavior) uses ♻️ `:recycle:` (behavioral refactor), NOT 🎨 `:art:`
- [ ] Change 4 (add dependency) uses ➕ `:heavy_plus_sign:`, NOT ✨ `:sparkles:` (which is for features, not deps)
- [ ] Each line keeps a valid Conventional Commits type+scope after the emoji (e.g. refactor:, style:, chore(deps):)
- [ ] Does NOT collapse all four to the same generic emoji or mislabel the art-vs-recycle pair
