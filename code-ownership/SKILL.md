---
name: code-ownership
description: Keep humans accountable for code they ship. Use immediately before a git commit, push, or pull request, and when a bug fix, new feature, business rule, domain model, architecture, or large refactor is about to be shipped.
---

# Code Ownership

Use this shipping gate to keep the user—not the agent—responsible for the intent and costly choices behind shipped code.

## Non-negotiable shipping gate

Before `git commit`, `git push`, or opening a pull request:

1. Get a plain-language explanation of the change, its expected behavior, and why it is safe. If the user already gave one, summarize it and ask them to confirm it.
2. State the files or behavior being shipped and the validation that supports it. Do not ship when the intent or validation is unknown.
3. Get explicit approval to ship. Do not treat "looks good" about a code review as approval to commit, push, or open a PR.

Do not revert working changes just because an explanation is missing; ask for it instead. Reverting is a separate, destructive action that needs the user's approval.

## Extra checks by change type

| Change                                                       | Required before shipping                                                                                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bug fix                                                      | Show the relevant reproduction, error, or stack trace (redact secrets). Confirm the proposed fix addresses the root cause, not only the reported symptom. |
| New feature                                                  | The user owns the implementation decision. Review their implementation; do not silently choose product behavior or scope.                                 |
| Large refactor, architecture, domain model, or business rule | Present concrete options and trade-offs. Wait for the user to choose before implementing or shipping.                                                     |
| Uncertain or high-risk behavior                              | Validate the smallest prototype in a separate git worktree before shipping; otherwise use the project's normal checks.                                    |

## Example

User: "Commit the retry fix."

Ask: "Please confirm: a retry with no payment method now returns the existing validation error instead of crashing. The changed path is `payments/retry.ts`; the regression test passes. May I commit `fix(payments): handle missing retry payment method`?"

Do not commit until the user confirms both the summary and the request to commit.
