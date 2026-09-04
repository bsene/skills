---
id: golang-testing-001-table-driven
skill: testing
---

# Prompt

Write the complete test file for this function, Go 1.21, plus one benchmark. Requirements: multiple cases in one test with individually named subtests including error cases; a shared helper function for the pass/fail assertion so failures report the caller's line, not the helper's; and tell me what to add to CI to catch data races.

```go
// ParseSize parses strings like "100B", "2KB", "1MB" into bytes
// (KB = 1024, MB = 1024*1024). Returns an error for empty or
// unparseable input.
func ParseSize(s string) (int64, error)
```

# Criteria

- [ ] Response uses a table-driven test: a slice of anonymous struct cases with a `name` field, iterated with `t.Run(tt.name, func(t *testing.T) {...})`
- [ ] Test cases include error inputs (empty string, invalid text like "abc") asserted via `err != nil` (with an early return/Fatal on unexpected nil error) alongside the valid cases
- [ ] The shared helper function begins with `t.Helper()` as its first statement (and explains it makes failures report the caller's line)
- [ ] The benchmark times only the loop: `b.ResetTimer()` after setup (or `b.Loop`), with the measured work inside `for range b.N` / `b.Loop()`
- [ ] Response recommends running `go test -race` (e.g. `go test -race ./...`) in CI to catch data races
- [ ] Response does NOT claim an external assertion library (testify) is required — stdlib `testing` is presented as sufficient for the task
