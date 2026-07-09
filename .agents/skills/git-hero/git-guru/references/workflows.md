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

## Choosing a workflow

| Factor            | GitFlow         | GitHub Flow  | Trunk-Based     |
| ----------------- | --------------- | ------------ | --------------- |
| Release cadence   | Scheduled       | Continuous   | Continuous      |
| Team size         | Any             | Small/medium | Medium/large    |
| CI/CD maturity    | Low needed      | Medium       | High required   |
| Branch complexity | High            | Low          | Minimal         |
| Best for          | Libraries, apps | Web services | Large tech orgs |

**Quick rule of thumb:**

- Versioned software (v1.0, v2.3…) → **GitFlow**
- Web service, continuous deploy, small team → **GitHub Flow**
- High-velocity team, strong CI/CD, feature flags → **Trunk-Based**

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
