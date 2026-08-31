---
id: git-hero-001-atomic-commits
skill: git-hero
---

# Prompt

I'm ready to commit. My working tree has three unrelated things: (1) a fix for a crash in our payment retry loop — a missing null check in `retryPayment` in `payments/retry.ts`; (2) in that same file, an unrelated variable rename I did while reading the code (`total` -> `orderTotal`); (3) a new OAuth2 login with Google in `auth/` — a new module, several files. We use Conventional Commits. Don't write any code — just tell me the commit message(s) to write and how to split the work across commits.

# Criteria

- [ ] Every commit message follows Conventional Commits `type(scope): description` (or `type: description` with optional scope)
- [ ] Splits into separate atomic commits: the OAuth2 feature is its own commit, separate from the payment fix, and the rename is not mixed into the fix commit
- [ ] Each commit message is a single one-liner — no body, no footer, no blank line
- [ ] Descriptions use imperative mood, lowercase after the colon, no trailing period
- [ ] Response does NOT append a Co-Authored-By trailer (or any trailer) to any commit message
- [ ] No single commit message joins two changes with "and" (the smell test for atomicity is applied or equivalent reasoning is given)