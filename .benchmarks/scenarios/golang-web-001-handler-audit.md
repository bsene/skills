---
id: golang-web-001-handler-audit
skill: golang-web
---

# Prompt

Review this Go HTTP code before we ship it — what's wrong, and what should the fixed version look like? We're on Go 1.23.

```go
package main

import (
	"encoding/json"
	"net/http"
)

func createUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
	}
	user, err := svc.Create(r.Context(), req)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func getUser(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/users/"):]
	render(w, svc.Get(id))
}

func main() {
	http.HandleFunc("/users", createUser)
	http.HandleFunc("/users/", getUser)
	http.ListenAndServe(":8080", nil)
}
```

Separately, our notification goroutine does:

```go
resp, err := http.Get(webhookURL)
if err != nil {
	return err
}
payload := parse(resp.Body)
```

# Criteria

- [ ] Flags the missing `return` after each `http.Error` — the handler keeps executing and double-writes, corrupting the response
- [ ] Flags the unbounded `r.Body` decode as a DoS vector and adds `http.MaxBytesReader(w, r.Body, N)` before decoding
- [ ] Replaces the ad-hoc path slicing (`r.URL.Path[len("/users/"):]`) with Go 1.22+ ServeMux method+pattern routing and `r.PathValue("id")`
- [ ] Replaces the global default mux (`http.HandleFunc` + `ListenAndServe(":8080", nil)`) with an explicit `http.NewServeMux()` passed to `http.ListenAndServe`
- [ ] Flags the missing `defer resp.Body.Close()` after the nil-error check in the `http.Get` client call (connection/resource leak)
- [ ] Does NOT recommend adopting a third-party router or framework (chi, gin, echo, gorilla/mux) for this API
