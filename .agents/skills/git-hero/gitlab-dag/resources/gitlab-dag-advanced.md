# GitLab DAG Advanced Reference

## Cross-Pipeline Dependencies (`needs:pipeline`)

When using parent-child or multi-project pipelines, you can reference jobs from upstream pipelines:

```yaml
# Child pipeline job referencing parent
deploy:
  stage: deploy
  needs:
    - pipeline: $PARENT_PIPELINE_ID
      job: build-artifacts
```

---

## `trigger:` + DAG

Child pipelines triggered via `trigger:` can also participate in DAG:

```yaml
stages: [build, downstream]

build:
  stage: build
  script: ./build.sh
  artifacts:
    paths: [dist/]

trigger-deploy:
  stage: downstream
  needs: [build] # waits for build before triggering child pipeline
  trigger:
    include: deploy/pipeline.yml
    strategy: depend # parent waits for child to finish
```

`strategy: depend` makes the parent job status reflect the child pipeline's result.

---

## `needs:artifacts` — Fine-Grained Artifact Control

By default, `needs:` downloads artifacts from listed jobs. You can control this:

```yaml
test:
  needs:
    - job: build
      artifacts: true # default — download artifacts
    - job: lint
      artifacts: false # don't download lint artifacts, just unblock on success
```

---

## Optional `needs:` with `allow_failure`

```yaml
deploy:
  needs:
    - job: test
      optional: true # deploy even if `test` job doesn't exist in this pipeline
```

Useful when a job is conditionally created (e.g., only on certain branches) and downstream jobs should still run.

---

## `needs:` with `rules:` — Conditional DAG

When a needed job might not exist (due to `rules:`), use `optional: true`:

```yaml
build-docker:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy:
  needs:
    - job: build-docker
      optional: true # don't fail if build-docker was skipped by rules
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

---

## Large-Scale Matrix: Splitting Dimensions

When a matrix would exceed 200 jobs, split into separate job groups:

```yaml
# Instead of one 250-combination matrix (5 × 5 × 10 = 250 ❌)
# Split into two logical groups:

build-group-a:
  parallel:
    matrix:
      - SERVICE: [api, web, worker]
        ENV: [staging, production]
        REGION: [us-east-1, eu-west-1] # 3×2×2 = 12 ✅

build-group-b:
  parallel:
    matrix:
      - SERVICE: [auth, cache]
        ENV: [staging, production]
        REGION: [us-east-1, eu-west-1, ap-southeast-1] # 2×2×3 = 12 ✅
```

---

## Visualizing Your DAG

GitLab provides a built-in pipeline DAG visualization at:
`CI/CD → Pipelines → [pipeline] → Pipeline graph → [switch to DAG view]`

Use this to verify your `needs:` relationships before merging complex pipeline changes.

---

## Performance Anti-Patterns

### Anti-pattern: Unnecessary stage barriers

```yaml
# ❌ Slow: all 3 stages must complete sequentially even when unrelated
stages: [build, security-scan, test]

build:
  stage: build

security-scan:
  stage: security-scan # waits for build even though it's unrelated

test:
  stage: test # waits for BOTH build and security-scan
```

```yaml
# ✅ Fast: security-scan and test both start immediately (or after their real deps)
build:
  stage: build

security-scan:
  stage: security-scan
  needs: [] # starts immediately, parallel with build

test:
  stage: test
  needs: [build] # only waits for build, not security-scan
```

### Anti-pattern: Over-specifying needs

```yaml
# ❌ Fragile: manually listing all matrix combinations
deploy:
  needs:
    - job: build
      parallel:
        matrix:
          - OS: ubuntu
            ARCH: amd64
          - OS: ubuntu
            ARCH: arm64
          - OS: alpine
            ARCH: amd64
          - OS: alpine
            ARCH: arm64
```

```yaml
# ✅ Maintainable: reference the full matrix or use expressions
deploy:
  needs:
    - job: build
      parallel:
        matrix:
          - OS: [ubuntu, alpine]
            ARCH: [amd64, arm64]
```
