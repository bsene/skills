# Verification Gate & Discipline (from Go katas)

Converged practice across several disciplined Go kata repos. These are the non-negotiables
that keep a Go codebase green and honest.

## The Verification Gate

Run the full gate, not just `go test`, before a task is done:

```bash
go test ./...  && \
go vet ./...   && \
staticcheck ./... && \
gofmt -d . | grep diff || echo "format ok"
```

## Table-Driven Tests Only

- Tests are **table-driven**; "no standalone assertion functions past the first row."
- Introduce a test-case helper only once more than one case needs the same assertion — rule of
  three applies to test helpers too.
- No `t.Fatal`/bare panic inside test loops where a table row can be marked independently.
- Re-run with `-race` on reruns; race is part of green, not an afterthought.

## No Third-Party Deps By Default

Prefer the stdlib (`math`, `sort`, `fmt`, `testing`) in katas and small tools. If a
dependency is genuinely needed: **pause and ask first** — never silently add one.

## Don't Pre-DRY

"Do not pre-DRY or extract yet unless you are at the third duplication of identical logic."
Extract on the third repetition, not earlier; a diff that contains only what a test drove is
the reviewable unit. Verify the diff contains nothing beyond that.

## Money & Domain: Explicit Types

Prefer explicit types over raw floats for money-related values — raw `float64` for currency
invites rounding bugs. Wrap and use sentinel/typed errors (`errors.Is`/`errors.As`) rather
than string comparison.
