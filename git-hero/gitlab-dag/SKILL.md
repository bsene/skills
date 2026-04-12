---
name: git-hero-gitlab-dag
description: "Design, write, review, or optimize GitLab CI/CD pipelines using DAG (Directed Acyclic Graph) with the needs keyword and parallelism features (parallel, parallel:matrix). Use this skill whenever the user mentions GitLab CI, .gitlab-ci.yml, pipeline optimization, job dependencies, the needs keyword, parallel matrix builds, pipeline speed, or wants to break free from strict stage ordering. Also trigger when the user asks about reducing CI runtime, fanning out jobs, matrix builds across OS/version/environment combinations, or 1:1 job dependency mapping between matrix jobs."
---

# GitLab DAG & Parallelism Skill

Use this skill to design, generate, review, and fix GitLab CI/CD pipeline configurations
that leverage DAG (`needs:`) and parallelism (`parallel:`, `parallel:matrix`).

---

## Core Concepts

### Standard Stage Order vs DAG

**Without DAG**: Jobs execute strictly stage-by-stage. All jobs in stage N must complete before stage N+1 starts — even if only one job in a stage is the actual prerequisite.

**With DAG (`needs:`)**: Jobs start as soon as their specific dependencies finish, skipping the stage-order wait. This can dramatically reduce total pipeline time.

```yaml
# Standard (slow): test waits for ALL build jobs to finish
stages: [build, test, deploy]

build-frontend:
  stage: build

build-backend:
  stage: build  # runs in parallel with build-frontend

test-frontend:
  stage: test   # waits for BOTH build jobs even though it only needs build-frontend

# DAG (fast): test-frontend starts the moment build-frontend finishes
test-frontend:
  stage: test
  needs: [build-frontend]   # ignores build-backend's status entirely
```

---

## Read On Demand

| Read When | File |
|---|---|
| Writing `needs:` dependencies, artifact control, immediate-start jobs | [needs: Keyword Reference](references/needs-keyword.md) |
| Using `parallel:`, `parallel:matrix`, or 1:1 matrix expressions | [Parallel & Matrix Patterns](references/parallel-and-matrix.md) |
| DRY patterns (YAML anchors, `!reference`), full pipeline examples | [DRY Patterns & Examples](references/dry-patterns-and-examples.md) |

---

## Decision Guide: Which Pattern to Use?

```
Need to parallelize?
├── Same job, split workload → parallel: N  (use $CI_NODE_INDEX/$CI_NODE_TOTAL)
├── Same job, different envs/versions → parallel:matrix
└── Different jobs → define separate jobs, link with needs:

Need cross-matrix dependencies?
├── One job needs ALL matrix instances → needs: with full matrix list
├── One job needs ONE specific instance → needs: with exact matrix values
└── N:1 same-shape mapping → use $[[ matrix.IDENTIFIER ]] expressions (GitLab 17+)

Need to reduce pipeline time?
├── Jobs without real dependencies → needs: [] (run immediately)
├── Long test suite → parallel: N sharding
└── Multi-env builds + tests → matrix + matrix expressions for 1:1 DAG
```

---

## Common Pitfalls & Fixes

| Problem                                         | Cause                                     | Fix                                                     |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Job still waits for unrelated jobs              | Not using `needs:`                        | Add `needs:` listing only direct prerequisites          |
| `parallel:matrix generates too many jobs`       | Cartesian product exceeds 200             | Reduce dimensions or split into separate job groups     |
| `needs:` breaks artifact download               | Non-listed jobs' artifacts are skipped    | Add `artifacts: true` explicitly for needed artifacts   |
| Matrix expression `$[[ matrix.X ]]` not working | GitLab version < 17 or typo in identifier | Check GitLab version; identifiers are case-sensitive    |
| `extends:` silently drops array values          | `extends` merges hashes, not arrays       | Use YAML anchors (`&anchor` / `<<: *anchor`) for arrays |
| Job starts too early                            | `needs: []` used unintentionally          | Remove `needs: []` if the job should wait for a stage   |

---

## Output Format

When writing or reviewing `.gitlab-ci.yml` snippets:

1. Always include `stages:` declaration for clarity
2. Comment non-obvious `needs:` relationships
3. Prefer `$[[ matrix.X ]]` expressions over manually listing all combinations
4. Include artifact handling (`artifacts:` block) when jobs produce outputs consumed by dependents
5. Validate the math: list total job count when using `parallel:matrix` (must be ≤ 200)
