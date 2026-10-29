# GitLab Flow and Pipeline Quick Wins

Sources: _GitLab Flow_ (GitLab whitepaper) and _First 30 Days DevOps Playbook_ (TWN). Paraphrased.

## GitLab Flow in one view

`main` is the integration branch. Add branches only when a deployment need requires them.

| Variant              | Use when                                 | Shape                                                               |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Production branch    | Deploys are not instant or timed         | `main` merges downstream into `production` when ready               |
| Environment branches | Several stages (staging, pre-prod, prod) | `main` -> `staging` -> `pre-production` -> `production`             |
| Release branches     | Shipping versioned software to others    | Cut `X-Y-stable` from `main`; fix on `main` first, then cherry-pick |

## Rules

| Rule                                                                     | Why                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Merge only downstream (main -> staging -> production), never back up     | Keeps a single path; what is in production was proven earlier |
| Fix in `main` first, then cherry-pick to release branches                | Prevents a fix living only in an old branch                   |
| Use feature branches off `main` with a merge request and CI before merge | Review and tests gate integration                             |
| Commit once, merge everywhere; do not re-author per branch               | Same hash trail aids audit                                    |
| Rebase local work before review; do not rebase shared branches           | Clean history without rewriting what others hold              |
| Issue-linked branch names (`123-fix-login`)                              | Traceability from issue to deploy                             |
| Tag releases on the release or production branch                         | Rollback and changelog anchors                                |

## Feature switches vs long-lived branches

| Approach                  | Trade-off                                                                |
| ------------------------- | ------------------------------------------------------------------------ |
| Feature flag in `main`    | Small merges, dark launches; cost is flag cleanup and test matrix growth |
| Long-lived feature branch | Isolation; cost is painful merges and delayed feedback                   |

Default to flags for risky or large work; delete each flag once fully rolled out.

## Pipeline quick wins

- Run the same pipeline for every merge request; require green before merge.
- Order stages fast to slow: lint, unit tests, build, integration, deploy.
- Build the artifact once and promote the same artifact through environments.
- Cache dependencies and run independent jobs in parallel.
- Keep secrets in the CI secret store, never in the repo.
- Make deploy and rollback one automated command; track lead time and failure rate.
