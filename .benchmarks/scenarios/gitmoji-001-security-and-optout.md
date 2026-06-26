---
id: gitmoji-001-security-and-optout
skill: git-hero-gitmoji
---

# Prompt

I just patched a bug where auth session tokens were being written to the application
log file in plaintext. The change touches `auth/logging.go`.

1. Give me the commit message for this change in gitmoji + Conventional Commits style.
2. Then give me the exact same commit message again, but in plain Conventional Commits
   with no emoji at all — our CI commitlint config rejects non-ASCII in the subject line.

# Criteria

- [ ] Part 1 uses the security override 🔒️ (`:lock:`), NOT the default fix 🐛 (`:bug:`), because the change patches a security/privacy leak
- [ ] Part 1 keeps the Conventional Commits structure intact: `fix(...)` type with a scope (e.g. `fix(auth): ...`) after the emoji
- [ ] Part 1 description is concrete about the change (stops logging/redacts session tokens), not generic
- [ ] Part 2 contains NO emoji and NO `:shortcode:` — a plain Conventional Commits subject only
- [ ] Part 2 preserves the same `fix(auth): ...` type and scope as part 1 (does not garble or drop the CC type)
- [ ] Does NOT claim emoji is mandatory or refuse the no-emoji request; honours the opt-out cleanly
