---
id: golang-router-001-idiomatic
skill: golang
---

# Prompt

Write an idiomatic Go function `readConfig(path string) (*Config, error)` that opens a
file, decodes JSON into a `Config` struct, and returns it. Keep it simple and idiomatic.

# Criteria

- [ ] Uses `defer f.Close()` for cleanup after opening the file
- [ ] Returns errors (wrapped with `fmt.Errorf("...: %w", err)`); does NOT `panic` or ignore errors with `_` on the open/decode path
- [ ] Checks each error immediately after the call that produced it (`if err != nil { return nil, ... }`)
- [ ] Returns `(*Config, error)` with `nil, err` on failure — no naked returns, no sentinel-by-string
- [ ] Does NOT over-engineer: no needless interface/generic abstraction, no goroutines/channels, no DI framework for a straight-line file read
- [ ] Does NOT strip required idioms in the name of "simplicity" — error handling and `defer` close remain present (simple ≠ skipping cleanup or error checks)
