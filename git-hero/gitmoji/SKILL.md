---
name: git-hero-gitmoji
description: "Selects and applies gitmoji emoji prefixes for Git commit messages, integrated with Conventional Commits format. Use when the user asks about gitmoji, wants an emoji for a commit message, asks 'which emoji for...', 'quel emoji pour...', mentions commit emoji conventions, says 'prefix my commit', 'gitmoji for', 'emoji commit', or wants to decorate commit messages with standardized emoji."
user-invocable: false
---

# Gitmoji

Standardized emoji guide for commit messages. Reference: [gitmoji.dev](https://gitmoji.dev/)

## Conventional Commits Integration

Gitmoji prefixes the Conventional Commits format — the CC structure stays intact:

```
<emoji> <type>(<scope>): <description>
```

**Examples:**

| Change | Commit message |
| ------ | -------------- |
| Add Google OAuth login | `✨ feat(auth): add OAuth2 login with Google` |
| Fix cart double-submit | `🐛 fix(cart): prevent double-submission on slow networks` |
| Upgrade React to v19 | `⬆️ chore(deps): upgrade React to v19` |

## CC Type → Default Gitmoji

| CC Type | Emoji | Code |
| ------- | ----- | ---- |
| `feat` | ✨ | `:sparkles:` |
| `fix` | 🐛 | `:bug:` |
| `docs` | 📝 | `:memo:` |
| `style` | 🎨 | `:art:` |
| `refactor` | ♻️ | `:recycle:` |
| `perf` | ⚡️ | `:zap:` |
| `test` | ✅ | `:white_check_mark:` |
| `chore` | 🔧 | `:wrench:` |
| `ci` | 💚 | `:green_heart:` |
| `build` | 👷 | `:construction_worker:` |
| `revert` | ⏪️ | `:rewind:` |

Use the default when no more specific gitmoji applies. Override with a more precise emoji when the context warrants it (see below).

## Selection Guide — Overriding Defaults

### Fix variants

| Situation | Emoji | Code |
| --------- | ----- | ---- |
| Regular bug fix | 🐛 | `:bug:` |
| Critical production hotfix | 🚑️ | `:ambulance:` |
| Simple non-critical fix | 🩹 | `:adhesive_bandage:` |
| Security or privacy fix | 🔒️ | `:lock:` |
| Typo fix | ✏️ | `:pencil2:` |
| Compiler / linter warning fix | 🚨 | `:rotating_light:` |

### Feat variants

| Situation | Emoji | Code |
| --------- | ----- | ---- |
| New feature (default) | ✨ | `:sparkles:` |
| New project / initial commit | 🎉 | `:tada:` |
| UI / style changes | 💄 | `:lipstick:` |
| Animations / transitions | 💫 | `:dizzy:` |
| Business logic | 👔 | `:necktie:` |

### Chore variants

| Situation | Emoji | Code |
| --------- | ----- | ---- |
| Configuration files | 🔧 | `:wrench:` |
| Dev scripts | 🔨 | `:hammer:` |
| Add dependency | ➕ | `:heavy_plus_sign:` |
| Remove dependency | ➖ | `:heavy_minus_sign:` |
| Upgrade dependency | ⬆️ | `:arrow_up:` |
| Downgrade dependency | ⬇️ | `:arrow_down:` |
| Pin dependency | 📌 | `:pushpin:` |
| .gitignore | 🙈 | `:see_no_evil:` |

### Removal variants

| Situation | Emoji | Code |
| --------- | ----- | ---- |
| Remove code or files | 🔥 | `:fire:` |
| Remove dead code specifically | ⚰️ | `:coffin:` |
| Deprecate (mark for future cleanup) | 🗑️ | `:wastebasket:` |

## Common Confusions

- **`:art:` vs `:recycle:`** — `:art:` is cosmetic (formatting, structure). `:recycle:` is behavioral (logic refactoring).
- **`:fire:` vs `:coffin:`** — `:fire:` removes any code/files. `:coffin:` specifically targets dead/unreachable code.
- **`:wrench:` vs `:hammer:`** — `:wrench:` is config files (tsconfig, eslint). `:hammer:` is dev scripts (Makefile, build scripts).
- **`:white_check_mark:` vs `:test_tube:`** — `:white_check_mark:` for passing tests. `:test_tube:` for intentionally failing tests (TDD red phase).
- **`:sparkles:` vs `:heavy_plus_sign:`** — `:sparkles:` adds a feature. `:heavy_plus_sign:` adds a dependency.

## Top 20 Quick Reference

| Emoji | Code | Description |
| ----- | ---- | ----------- |
| ✨ | `:sparkles:` | New feature |
| 🐛 | `:bug:` | Bug fix |
| 📝 | `:memo:` | Documentation |
| ♻️ | `:recycle:` | Refactor |
| ⚡️ | `:zap:` | Performance |
| 🎨 | `:art:` | Code structure / format |
| 🔥 | `:fire:` | Remove code / files |
| ✅ | `:white_check_mark:` | Tests |
| 🚀 | `:rocket:` | Deploy |
| 💄 | `:lipstick:` | UI / style |
| 🔧 | `:wrench:` | Configuration |
| ⬆️ | `:arrow_up:` | Upgrade dependency |
| 💚 | `:green_heart:` | Fix CI |
| 👷 | `:construction_worker:` | CI build system |
| 🚧 | `:construction:` | Work in progress |
| 🚑️ | `:ambulance:` | Critical hotfix |
| 🔒️ | `:lock:` | Security fix |
| ⏪️ | `:rewind:` | Revert |
| 🗃️ | `:card_file_box:` | Database changes |
| 🏷️ | `:label:` | Types |

## Full Catalog

For the complete 73-emoji catalog grouped by category, see [references/gitmoji-catalog.md](references/gitmoji-catalog.md).
