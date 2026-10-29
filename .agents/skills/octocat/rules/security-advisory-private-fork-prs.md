---
name: security-advisory-private-fork-prs
description: Create a repository security advisory's temporary private fork and open a fix pull request inside it with gh
metadata:
  tags: github, gh-cli, security-advisories, ghsa, private-fork, pull-requests, embargo
---

# Pull requests in a GHSA temporary private fork

Embargoed fixes belong in the advisory's temporary private fork, never in the public repository or a regular fork. The fork is a separate private repository named `OWNER/REPO-ghsa-xxxx-xxxx-xxxx`. Pull requests inside it target that fork's own branches; GitHub merges them upstream from the advisory page.

## Workflow

```bash
set -o pipefail
repo='OWNER/REPO'
ghsa='GHSA-xxxx-xxxx-xxxx'
base="repos/$repo/security-advisories/$ghsa"
headers=(-H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28')

# 1. Reuse the existing fork if there is one.
fork=$(gh api "$base" "${headers[@]}" --jq '.private_fork.full_name // empty')

# 2. Otherwise create it (only when the user asked for a fork or a fix PR).
if [ -z "$fork" ]; then
  fork=$(gh api --method POST "$base/forks" "${headers[@]}" --jq '.full_name')
fi
echo "$fork"   # OWNER/REPO-ghsa-xxxx-xxxx-xxxx, private

# 3. Add the fork as a remote and branch without upstream tracking,
#    so a bare `git push` can never reach the public origin.
git remote add ghsa "git@github.com:$fork.git"
git fetch ghsa
git switch --no-track -c fix/ghsa-short-name ghsa/main

# ...commit the fix...

# 4. Push explicitly to the private fork.
git push -u ghsa fix/ghsa-short-name

# 5. Open the PR inside the fork. Always pass --repo: without it gh
#    targets the public origin repository.
gh pr create --repo "$fork" --base main --head fix/ghsa-short-name \
  --title "<title>" --body-file /path/to/private-pr-body.md
```

Confirm the result with `gh pr view <num> --repo "$fork" --json url,baseRefName,headRefName,state`.

## Rules

- Push only to the `ghsa` remote while the fix is embargoed. Never push the branch to `origin`, open a PR against the public repository, or mention the vulnerability in public commits, issues, or CI logs.
- Use the fork's default branch as `--base`; check it with `gh api "repos/$fork" --jq .default_branch`. The fork is a snapshot from when it was created, so rebase onto upstream changes yourself (`git fetch origin && git rebase origin/main`) before pushing.
- Write PR titles and bodies that are fine to become public once the advisory is published; keep exploit details in the advisory, not the PR.
- GitHub Actions do not run in the private fork (`gh pr checks` reports no checks). Run the test suite and linters locally and say so; do not claim CI passed.
- Do not merge the PR with `gh pr merge` inside the fork: that only merges into the fork's own `main`, not upstream. Merging the fork's PRs into the upstream repository is done from the advisory page by a maintainer; leave that step to them.
- Remove the local `ghsa` remote after the work is merged or abandoned.

## Errors and limits

- `POST .../forks` on an advisory that already has a fork returns `403 A repository already exists for this security advisory.` Read `private_fork.full_name` from the advisory instead of retrying.
- Creating the fork requires write access to the advisory (repository admin, security manager, or advisory collaborator; confirm against the [REST reference](https://docs.github.com/en/rest/security-advisories/repository-advisories#create-a-temporary-private-fork)). A `404` on the advisory means it is unknown or not visible to this token; stop and report rather than probing further.
- Publishing the advisory deletes the fork, so fix PRs must be merged upstream first ([lifecycle](security-advisory-lifecycle.md)). Closing the advisory does not delete the fork or close its PRs. Deleting the fork repository needs the `delete_repo` scope; do not request extra scopes without the user's approval.
- The fork is returned with `"fork": false` and `"private": true`, so do not detect it by the `fork` flag; use the advisory's `private_fork` field.

## Verification boundary

On October 17, 2026, at the repository owner's request, a synthetic draft advisory on `mcollina/skills` verified with `gh` 2.83.2 and an OAuth token carrying `repo`: creating the fork via REST, pushing a branch over SSH, `gh pr create --repo <fork>` against the fork's `main`, the `403` on a second fork request, the absence of Actions checks, and that closing the advisory left the fork and its open PR in place. Merging fork PRs upstream from the advisory page and collaborator access for non-admin reporters were not tested.
