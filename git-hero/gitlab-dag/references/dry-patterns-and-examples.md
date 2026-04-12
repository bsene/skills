# DRY Patterns & Examples

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

> `extends:` merges hashes but **not arrays** — for `script:` blocks or array overrides, prefer YAML anchors or `!reference`.

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
