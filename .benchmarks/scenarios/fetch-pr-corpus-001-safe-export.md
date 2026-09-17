---
id: fetch-pr-corpus-001-safe-export
skill: fetch-pr-corpus
---

# Prompt

Create a review corpus from merged pull requests in `acme/payments`, including review comments and changed files. It must be safe to share internally and should not mutate the repository.

# Criteria

- [ ] Uses merged pull requests as the source and includes reviews, comments, and changed files
- [ ] Produces a structured export suitable for later analysis
- [ ] Identifies and removes or redacts secrets and personally identifying data before sharing
- [ ] Does not modify pull requests, branches, or repository files unnecessarily
- [ ] States any required GitHub authentication or access scope
