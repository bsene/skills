# `needs:` Keyword Reference

## Basic syntax

```yaml
job-b:
  stage: deploy
  needs:
    - job: job-a # must specify job name
    - job: job-c
      artifacts: false # optional: don't download artifacts from job-c
```

## Key rules

- `needs:` can reference jobs in **any stage**, including the same stage or even a later stage (use `needs: []` to start immediately with no dependencies)
- Max `needs:` entries per job: **50** (configurable by admins, default 50)
- If `needs:` is empty (`needs: []`), the job starts immediately when the pipeline begins
- A job with `needs:` **skips** artifact download from non-listed jobs by default
- You can still combine `needs:` with `stage:` for organizational clarity — stages still help the UI display

## Start a job immediately (no prerequisites)

```yaml
lint:
  stage: test
  needs: [] # runs as soon as the pipeline starts, regardless of other jobs
  script: ./run-lint.sh
```
