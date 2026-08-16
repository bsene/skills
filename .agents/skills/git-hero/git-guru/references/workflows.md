# Git Workflows Reference

---

## Table of Contents

1. [GitFlow](#gitflow)
2. [GitHub Flow](#github-flow)
3. [Trunk-Based Development](#trunk-based-development)
4. [Choosing a workflow](#choosing-a-workflow)
5. [Commit message conventions](#commit-message-conventions)
6. [Branch naming conventions](#branch-naming-conventions)

---

## GitFlow

Created by Vincent Driessen. Suited for **versioned software with scheduled releases** (libraries, desktop apps, mobile apps).

### Branches

- `main` — production-ready code only, always stable
- `develop` — integration branch for next release
- `feature/*` — new features (branch from `develop`, merge back to `develop`)
- `release/*` — release preparation (branch from `develop`, merge to `main` + `develop`)
- `hotfix/*` — urgent production fixes (branch from `main`, merge to `main` + `develop`)

### Commands

```bash
# Start a feature
git switch develop && git switch -c feature/my-feature

# Finish a feature
git switch develop
git merge --no-ff feature/my-feature
git branch -d feature/my-feature

# Start a release
git switch -c release/1.2.0 develop

# Finish a release
git switch main && git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"
git switch develop && git merge --no-ff release/1.2.0
git branch -d release/1.2.0

# Hotfix
git switch -c hotfix/fix-login main
git switch main && git merge --no-ff hotfix/fix-login && git tag -a v1.2.1
git switch develop && git merge --no-ff hotfix/fix-login
git branch -d hotfix/fix-login
```

### Pros / Cons

| Pros                                   | Cons                                             |
| -------------------------------------- | ------------------------------------------------ |
| Clear structure for versioned releases | Complex — many long-lived branches               |
| Supports parallel release maintenance  | Lots of merge commits                            |
| Hotfix process is explicit             | Overkill for web apps with continuous deployment |

---

## GitHub Flow

Simple, lightweight workflow for **continuous deployment** (web services, SaaS).

### Rules

1. `main` is always deployable
2. Create a feature branch from `main`
3. Open a Pull Request early
4. Review, discuss, iterate
5. Merge to `main` → deploy immediately

### Pros / Cons

| Pros                                | Cons                                           |
| ----------------------------------- | ---------------------------------------------- |
| Simple — only one long-lived branch | No built-in release management                 |
| Fast feedback loop                  | Requires feature flags for incomplete features |
| Great for CI/CD                     | Not suited for versioned/parallel releases     |

---

## Trunk-Based Development

Developers commit **directly to `main`** (or via very short-lived branches < 2 days). Designed for high-velocity teams with strong CI/CD.

### Rules

- Branches live at most 1-2 days
- Commits to main must keep it green (tests pass)
- Incomplete features hidden behind **feature flags**
- Release branches cut from main when needed

### Pros / Cons

| Pros                           | Cons                                       |
| ------------------------------ | ------------------------------------------ |
| Minimal merge conflicts        | Requires mature CI/CD pipeline             |
| Forces small, frequent commits | Requires feature flag discipline           |
| Linear, readable history       | Hard for junior teams without strong tests |

---

## Ship / Show / Ask

A branching strategy that combines Pull Request feedback with Continuous Integration speed. Introduced by Rouan Wilsenach (martinfowler.com, 2021). Every change is independently categorized as one of three modes, chosen by the author making the change.

### The three modes

| Mode | What happens | Works great when |
| ---- | ------------ | ----------------- |
| **Ship** | Commit straight to mainline. No PR, no review wait. | Established pattern, unremarkable bug fix, doc update, applying feedback already discussed |
| **Show** | Open a PR, but merge it immediately once automated checks pass — don't wait for approval. The PR exists as a space for feedback *after* the change is already live. | Interesting approach/refactor worth sharing; confident in the change but want visibility |
| **Ask** | Open a PR and wait for feedback before merging. | Genuinely unsure of the approach, want discussion first, experiments, "will this work?" |

```
main ──●───●──────●────●─────●────
        \         PR    PR (merge
      (Ship,   (Show, merge  waits for
      no PR)   immediately)  feedback = Ask)
```

### Rules

- Approval is **never** a requirement to merge — authors merge their own Pull Requests.
- The author decides whether a change is Ship, Show, or Ask, and controls when it goes live.
- Branches stay short-lived and get rebased on mainline often.
- Keep mainline releasable with standard CI/CD techniques (feature toggles, etc.) — this applies even to Ship-level changes.
- Not opening a PR is not a pass on talking to the team — synchronous conversation (calls, pairing) still matters, especially before starting a change.

### The balance

There's no fixed ratio — it shifts with trust and familiarity. High-trust, experienced teams Ship more; teams still building shared standards Show and Ask more. A junior engineer might mostly Show/Ask; a senior engineer mostly Ships but occasionally Shows a new technique. Teams stuck in "mostly Ask" often have an underlying trust problem — mandatory-approval policies are a band-aid, not a fix; more Showing (plus training, pairing) builds the trust that removes the need for it.

### Pros / Cons

| Pros                                              | Cons                                                    |
| -------------------------------------------------- | -------------------------------------------------------- |
| Best of CI speed and PR feedback culture           | Requires real team trust and a shared quality bar        |
| No PR-approval queue bottleneck                     | Needs feature-flag discipline to keep mainline releasable |
| Scales naturally with trust (seniors ship, juniors ask more) | Not a fit for heavily regulated / mandatory-review environments |
| Avoids the "rubber-stamp approval" anti-pattern    | Async review happens after merge, not before             |

Source: https://martinfowler.com/articles/ship-show-ask.html

---

## Choosing a workflow

| Factor            | GitFlow         | GitHub Flow  | Trunk-Based     | Ship/Show/Ask                      |
| ----------------- | --------------- | ------------ | --------------- | ----------------------------------- |
| Release cadence   | Scheduled       | Continuous   | Continuous      | Continuous                          |
| Team size         | Any             | Small/medium | Medium/large    | Small/medium, high-trust            |
| CI/CD maturity    | Low needed      | Medium       | High required   | High required                       |
| Branch complexity | High            | Low          | Minimal         | Low (short branches, no approval gate) |
| Best for          | Libraries, apps | Web services | Large tech orgs | High-trust teams wanting PR feedback without blocking merges |

**Quick rule of thumb:**

- Versioned software (v1.0, v2.3…) → **GitFlow**
- Web service, continuous deploy, small team → **GitHub Flow**
- High-velocity team, strong CI/CD, feature flags → **Trunk-Based**
- High-trust team that wants PR feedback without blocking on approval → **Ship/Show/Ask**

---

## Commit message conventions

### Conventional Commits (recommended)

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer: BREAKING CHANGE, closes #123]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**

```
feat(auth): add OAuth2 login with Google
fix(cart): prevent double-submission on slow networks
docs: update README with Docker setup
refactor(api): extract validation into middleware
```

**Breaking change:**

```
feat(api)!: rename /users endpoint to /accounts

BREAKING CHANGE: all clients must update API calls.
Closes #142
```

### Imperative mood rule

Write as if completing: **"If applied, this commit will…"**

- "Add user authentication" ✅
- "Fix null pointer in login handler" ✅
- "Added authentication" ❌
- "Fixing bugs" ❌

---

## Branch naming conventions

```bash
feature/user-authentication
feature/JIRA-123-add-payment
fix/login-null-pointer
release/1.2.0
hotfix/critical-xss-vulnerability
chore/upgrade-dependencies
```

Rules: lowercase, hyphen-separated, include ticket number when applicable.
