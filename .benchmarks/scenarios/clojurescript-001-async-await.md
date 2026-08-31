---
id: clojurescript-001-async-await
skill: clojurescript
---

# Prompt

Convert this JavaScript to idiomatic ClojureScript. Our codebase does NOT use core.async, so please use ClojureScript's native async support:

```js
async function loadUsers(ids) {
  const token = (await fetch("/auth/token")).json();
  const users = await Promise.all(ids.map(id => fetchUser(id, token)));
  return { token, users };
}
```

`fetchUser` already exists as a CLJS function returning a js/Promise. Explain how the resulting CLJS function behaves from the caller's perspective.

# Criteria

- [ ] Response puts `^:async` metadata on the function head (`defn ^:async` or `(fn ^:async [...]`), not on the argument vector
- [ ] Response uses the `await` macro in its CLJS form (`js/await` or `await`) inside the async function for the sequential fetch
- [ ] Response keeps the concurrent part as `js/Promise.all` (e.g. over a `mapv`/array of promises), not awaiting a plain lazy `map`
- [ ] Response explains that the `^:async` function returns a js/Promise even though the body looks like it returns a plain map, and the caller must consume it as one
- [ ] Response does NOT use core.async (`go`/`<!`/channels)
- [ ] Response does NOT translate by keeping JS-style `.then` chains or claim `await` works inside a plain (non-`^:async`) `defn`