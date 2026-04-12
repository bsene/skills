# Parallel & Matrix Patterns

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
