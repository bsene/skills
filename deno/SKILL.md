---
name: deno
description: Build, debug, review, or migrate JavaScript and TypeScript applications using Deno. Use for Deno CLI commands, deno.json configuration, permissions, JSR/npm dependencies, Deno.serve, Deno.test, and Node-to-Deno compatibility. For Fresh or Deno Deploy specifics, consult their own official documentation.
---

# Deno

Use [Deno's official documentation](https://docs.deno.com/runtime/) as the source
of truth. Check `deno --version` and the project's configuration before choosing
APIs or flags; current online documentation may describe a newer runtime.
Verify uncertain or version-sensitive behavior against the relevant page and
local `deno <command> --help`. Cite the specific documentation used.

## Start with the existing project

- Inspect `deno.json` / `deno.jsonc`, `package.json`, lockfiles, workspace members,
  and existing tasks. Preserve the project's dependency and tooling conventions.
- For a new Deno project, use `deno init` when its starter fits. Do not add a
  transpiler, bundler, test framework, or formatter merely to run TypeScript.
- Prefer built-in Web APIs (`fetch`, `Request`, `Response`, streams, Web Crypto)
  and Deno APIs before adding dependencies.
- Running TypeScript does not imply type checking. Run `deno check` explicitly.

See [configuration](https://docs.deno.com/runtime/fundamentals/configuration/)
and [type checking](https://docs.deno.com/runtime/reference/cli/check/).

## Dependencies and modules

- Use ESM with explicit extensions for relative imports, such as `./handler.ts`.
- Add JSR packages with `deno add jsr:@std/assert`; use `deno add npm:<package>`
  for npm packages. Reuse existing import aliases and dependency declarations.
- Prefer maintained `@std` packages on JSR over legacy `deno.land/std` URLs for
  new dependencies. Standard-library packages are dependencies, not runtime globals.
- Keep the project's lockfile tracked. Use frozen lockfile behavior in CI when
  reproducibility is required; verify the supported flag for the installed version.
- Use `deno info <entrypoint>` to investigate the resolved dependency graph.

See [modules](https://docs.deno.com/runtime/fundamentals/modules/).

## Permissions

Grant the access the actual code needs, scoped to resources where possible:

```sh
deno run --allow-net=api.example.com --allow-env=API_KEY main.ts
deno run --allow-read=./data --allow-write=./output main.ts
```

- Diagnose a permission failure at the operation that requires access; do not
  automatically replace scoped flags with `-A` / `--allow-all`.
- Dependencies share the caller's permissions. Permissions are not isolation
  between modules; loading the initial static import graph is distinct from I/O.
- Subprocesses and native libraries can bypass Deno's sandbox. Treat
  `--allow-run` and `--allow-ffi` as trust decisions, even when scoped.
- For unattended runs, use `--no-prompt` so missing permissions fail explicitly.

See [security and permissions](https://docs.deno.com/runtime/fundamentals/security/).

## HTTP and tests

For a small HTTP service, start with `Deno.serve` and a handler returning a
`Response`; add a framework when routing or middleware requirements justify it.
Keep request handling separately callable when testing it avoids opening a port.
Validate untrusted input and preserve normal HTTP error handling.

Use `Deno.test` and assertions from `@std/assert`. Give tests only their required
permissions. Await asynchronous work and close resources; investigate resource
or operation sanitizer failures instead of disabling the sanitizers by default.
Use `deno test --coverage=coverage` and `deno coverage coverage` when coverage is
requested.

See [HTTP servers](https://docs.deno.com/runtime/fundamentals/http_server/)
and [testing](https://docs.deno.com/runtime/test/).

## Node compatibility

Preserve working `package.json` dependencies and scripts during migration.
Use `node:` imports for Node built-ins and `npm:` specifiers or existing package
declarations for npm dependencies. Do not rewrite compatible Node code merely
to use Deno APIs.

If a package requires local `node_modules`, inspect `nodeModulesDir` and choose
the mode matching the project. Native Node-API addons require local
`node_modules` and FFI permission. Lifecycle scripts are not enabled by default;
allow only the required, trusted packages rather than enabling every script.
Check compatibility for the specific API or package instead of assuming parity.

See [Node and npm compatibility](https://docs.deno.com/runtime/fundamentals/node/).

## Validate the change

Run existing project tasks first. When no equivalent task exists, use the
relevant built-in checks:

```sh
deno fmt --check
deno lint
deno check main.ts
deno test
```

Choose the actual entrypoints and required test permissions. Report the commands
run and any checks blocked by missing dependencies or permissions.
