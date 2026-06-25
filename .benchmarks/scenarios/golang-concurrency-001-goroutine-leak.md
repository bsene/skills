---
id: golang-concurrency-001-goroutine-leak
skill: golang-concurrency
---

# Prompt

Review this Go function. It's called on every request in a long-running service. Is anything wrong?

```go
func fanOut(ids []int) []Result {
	ch := make(chan Result)
	for _, id := range ids {
		go func() {
			ch <- fetch(id)
		}()
	}
	results := make([]Result, 0, len(ids))
	for range ids {
		results = append(results, <-ch)
	}
	return results
}
```

# Criteria

- [ ] Identifies the loop-variable capture bug (`id` shared across goroutines pre-Go 1.22) OR notes it is safe only on Go 1.22+
- [ ] Identifies that there is no `context`/cancellation — a slow/hung `fetch` leaks the goroutine and blocks the collector
- [ ] Notes the unbuffered channel couples sender/receiver; recommends buffering or a bounded worker pool rather than one goroutine per id
- [ ] Recommends `errgroup` (or equivalent) to propagate errors and cancel siblings, instead of dropping `fetch` failures
- [ ] Recommends `-race` to validate the fix
- [ ] Does NOT introduce shared mutable state without synchronization in the proposed fix
