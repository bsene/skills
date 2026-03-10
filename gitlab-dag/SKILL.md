---
name: gitlab-dag
description: >
  Design, write, review, or optimize GitLab CI/CD pipelines using DAG (Directed Acyclic Graph)
  with the `needs:` keyword and parallelism features (`parallel:`, `parallel:matrix`).
  Use this skill whenever the user mentions GitLab CI, `.gitlab-ci.yml`, pipeline optimization,
  job dependencies, the `needs:` keyword, parallel matrix builds, pipeline speed, or wants to
  break free from strict stage ordering. Also trigger when the user asks about reducing CI
  runtime, fanning out jobs, matrix builds across OS/version/environment combinations, or
  1:1 job dependency mapping between matrix jobs. If the request involves GitLab pipelines
  at all — even simple questions — consult this skill first.
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

## `needs:` Keyword Reference

### Basic syntax

```yaml
job-b:
  stage: deploy
  needs:
    - job: job-a # must specify job name
    - job: job-c
      artifacts: false # optional: don't download artifacts from job-c
```

### Key rules

- `needs:` can reference jobs in **any stage**, including the same stage or even a later stage (use `needs: []` to start immediately with no dependencies)
- Max `needs:` entries per job: **50** (configurable by admins, default 50)
- If `needs:` is empty (`needs: []`), the job starts immediately when the pipeline begins
- A job with `needs:` **skips** artifact download from non-listed jobs by default
- You can still combine `needs:` with `stage:` for organizational clarity — stages still help the UI display

### Start a job immediately (no prerequisites)

```yaml
lint:
  stage: test
  needs: [] # runs as soon as the pipeline starts, regardless of other jobs
  script: ./run-lint.sh
```

---

## `parallel:` — Simple Test Sharding

Split a single job into N clones running concurrently. GitLab injects `$CI_NODE_INDEX` (1-based) and `$CI_NODE_TOTAL` automatically.

```yaml
test:
  stage: test
  parallel: 5 # creates test 1/5, test 2/5, ... test 5/5
  script:
    - bundle exec rspec --format progress \
      $(ruby -e "
      files = Dir['spec/**/*_spec.rb']
      chunk = files.each_slice((files.size.to_f / $CI_NODE_TOTAL).ceil).to_a
      puts chunk[$CI_NODE_INDEX - 1].join(' ')
      ")
```

Max value: **200** parallel instances.

---

## `parallel:matrix` — Multi-Dimensional Jobs

Run the same job configuration across a set of variable combinations. Each combination becomes a separate job named `job-name: [VAL1, VAL2]`.

```yaml
build:
  stage: build
  image: python:$VERSION
  script: ./build.sh
  parallel:
    matrix:
      - VERSION: ["3.10", "3.11", "3.12"]
        PLATFORM: [linux, macos]
```

This creates 6 jobs: every `VERSION × PLATFORM` permutation.

**Limit**: max **200** jobs total from a matrix. Plan your dimensions accordingly — check the math before adding values.

---

## `needs:` + `parallel:matrix` — DAG with Matrix

### Reference ALL instances of a matrix job

```yaml
deploy:
  stage: deploy
  needs:
    - job: build
      parallel:
        matrix:
          - VERSION: ["3.10", "3.11", "3.12"]
            PLATFORM: [linux, macos]
```

Deploy waits for **all 6** build matrix jobs.

### Reference a SPECIFIC matrix instance

```yaml
deploy-linux-310:
  stage: deploy
  needs:
    - job: build
      parallel:
        matrix:
          - VERSION: "3.10"
            PLATFORM: linux
```

### 1:1 Mapping with Matrix Expressions (GitLab 17+)

Use `$[[ matrix.IDENTIFIER ]]` to create automatic 1:1 dependencies — each test instance only waits for its matching build instance:

```yaml
build:
  stage: build
  parallel:
    matrix:
      - OS: [ubuntu, alpine]
        ARCH: [amd64, arm64]
  script: ./build.sh $OS $ARCH

test:
  stage: test
  parallel:
    matrix:
      - OS: [ubuntu, alpine]
        ARCH: [amd64, arm64]
  needs:
    - job: build
      parallel:
        matrix:
          - OS: ["$[[ matrix.OS ]]"]
            ARCH: ["$[[ matrix.ARCH ]]"]
  script: ./test.sh $OS $ARCH
```

`test: [ubuntu, amd64]` only waits for `build: [ubuntu, amd64]` — not the other 3 build jobs. This is the most powerful pattern for large matrix pipelines.

---

## DRY Patterns with YAML Anchors & `!reference`

Avoid repeating the same `parallel:matrix` block across multiple jobs.

### YAML Anchors

```yaml
.matrix: &matrix
  parallel:
    matrix:
      - OS: [ubuntu, alpine]
        ARCH: [amd64, arm64]

build:
  stage: build
  <<: *matrix
  script: ./build.sh

test:
  stage: test
  <<: *matrix
  needs:
    - job: build
      parallel:
        matrix:
          - OS: ["$[[ matrix.OS ]]"]
            ARCH: ["$[[ matrix.ARCH ]]"]
  script: ./test.sh
```

> ⚠️ `extends:` merges hashes but **not arrays** — for `script:` blocks or array overrides, prefer YAML anchors or `!reference`.

---

## Full Example: Optimized Multi-Language Pipeline

```yaml
stages:
  - lint
  - build
  - test
  - deploy

# Starts immediately — no dependencies
lint:
  stage: lint
  needs: []
  script: ./run-linters.sh

# Matrix build: 6 jobs (3 versions × 2 platforms)
build:
  stage: build
  needs: [lint]
  parallel:
    matrix:
      - LANG_VERSION: ["3.10", "3.11", "3.12"]
        PLATFORM: [linux, windows]
  script: ./build.sh $LANG_VERSION $PLATFORM
  artifacts:
    paths: [dist/]

# 1:1 test-per-build via matrix expressions
unit-test:
  stage: test
  parallel:
    matrix:
      - LANG_VERSION: ["3.10", "3.11", "3.12"]
        PLATFORM: [linux, windows]
  needs:
    - job: build
      parallel:
        matrix:
          - LANG_VERSION: ["$[[ matrix.LANG_VERSION ]]"]
            PLATFORM: ["$[[ matrix.PLATFORM ]]"]
  script: ./test.sh $LANG_VERSION $PLATFORM

# Parallel sharding of integration tests (independent)
integration-test:
  stage: test
  needs: [] # starts immediately, doesn't wait for build
  parallel: 4
  script: ./integration-test.sh

# Deploy only after all unit-tests and integration-tests pass
deploy:
  stage: deploy
  needs:
    - job: unit-test
      parallel:
        matrix:
          - LANG_VERSION: ["3.10", "3.11", "3.12"]
            PLATFORM: [linux, windows]
    - job: integration-test
  script: ./deploy.sh
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

## Output Format

When writing or reviewing `.gitlab-ci.yml` snippets:

1. Always include `stages:` declaration for clarity
2. Comment non-obvious `needs:` relationships
3. Prefer `$[[ matrix.X ]]` expressions over manually listing all combinations
4. Include artifact handling (`artifacts:` block) when jobs produce outputs consumed by dependents
5. Validate the math: list total job count when using `parallel:matrix` (must be ≤ 200)

For more details, read `references/gitlab-dag-advanced.md` when handling complex nested DAGs, `trigger:` with child pipelines, or `needs:pipeline` cross-pipeline dependencies.
