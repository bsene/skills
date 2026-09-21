---
name: code-ownership
description: Keep humans accountable for code they ship and ensure shared understanding after meaningful work. Use before a git commit, push, or pull request, and after code changes, commands, or reports when recommending a next step.
---

# Code Ownership

Keep the user—not the agent—responsible for shipped changes, and make recommendations from verified facts.

## After meaningful work

Before recommending a next step:

1. Report only verified facts: changed files, commands run, and observed results. State what was not verified.
2. Ask whether the user understands the change or result and what remains unclear.
3. Resolve facts yourself; ask the user only for decisions they own.
4. Run the smallest relevant test or inspection before making a recommendation. If that is impossible, present the option as unverified.

Skip this for a simple factual answer or when no work was performed.

## Non-negotiable shipping gate

Changes limited to skill-installation files—`.agents/skills/`, `.claude/skills/`, `.pi/skills/`, `skills-lock.json`, and equivalent skill metadata—are pre-approved and do not require this prompt. The rule does not apply to application code or unrelated files.

Before `git commit`, `git push`, or opening a pull request:

1. Show the complete changed-file unified diff with three lines of context. Always show changes as a diff; do not replace it with a summary or stat.
2. Immediately ask the user to explain in one plain-language sentence what the change is about, then confirm its expected behavior, why it is safe, the files or behavior being shipped, and the validation supporting it. A bare "yes" or ownership confirmation is insufficient; ask again for the explanation. Do not summarize the change after showing the diff before asking this question.
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
