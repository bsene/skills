---
id: golang-packages-and-modules-001-module-mechanics
skill: packages-and-modules
---

# Prompt

Go modules question set for our team's shared library `github.com/acme/util`, currently v1.4.x:

(a) We're making breaking changes and want to tag v2.0.0. Exactly what has to change in the library's go.mod and in consumers' import paths?
(b) One of our services still needs the old v1 API while a newer module uses v2. Can both coexist in the same build?
(c) Our CI currently runs `go get github.com/goreleaser/goreleaser` to get a build tool, and the go.mod keeps getting modified. What's the right command?
(d) During development we point `replace github.com/acme/util => ../util` at a local checkout. Is it OK to leave that in when we tag the release?
(e) Module A requires `github.com/acme/util v1.2.0`, module B requires `v1.3.0`, and `v1.5.0` exists upstream. When we build a program importing both, which version of util is used, and why?

# Criteria

- [ ] Response states the v2 module path in go.mod must become `github.com/acme/util/v2` and consumers must import `github.com/acme/util/v2/...` (major version = new import path)
- [ ] Response confirms v1 and v2 can coexist in the same build because they are distinct import paths
- [ ] Response recommends `go install github.com/goreleaser/goreleaser@latest` (or `@version`) for tools, explaining `go get` modifies go.mod while `go install` does not
- [ ] Response says the `replace` directive is for local development only and must be removed before tagging/releasing
- [ ] Response states the build resolves to `v1.3.0` — the minimum version satisfying all requirements (Minimum Version Selection), not the latest available `v1.5.0`
- [ ] Response does NOT claim that tagging `v2.0.0` alone is sufficient, or that `/v2` path changes are optional for v2+ releases
