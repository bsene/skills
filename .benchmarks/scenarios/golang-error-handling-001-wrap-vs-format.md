---
id: golang-error-handling-001-wrap-vs-format
skill: golang-error-handling
---

# Prompt

A reviewer flagged this Go code. Fix the error handling and explain why.

```go
func loadConfig(path string) (*Config, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("opening config: %v", err)
	}
	defer f.Close()

	var c Config
	if err := json.NewDecoder(f).Decode(&c); err != nil {
		panic(err)
	}
	return &c, nil
}
```

# Criteria

- [ ] Changes the first `%v` to `%w` so the wrapped error stays inspectable via `errors.Is`/`errors.As`
- [ ] Explains the `%w` vs `%v` distinction (wrap preserves the chain; `%v` flattens to string)
- [ ] Replaces `panic(err)` with a returned wrapped error — never panic on an expected/recoverable error
- [ ] Mentions callers can use `errors.Is(err, os.ErrNotExist)` once wrapped correctly
- [ ] Does NOT over-wrap (no redundant "failed to" prefixes that duplicate the cause)
- [ ] Keeps error strings lowercase, no trailing punctuation (Go convention)
