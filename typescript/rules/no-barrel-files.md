---
name: no-barrel-files
description: >
  Do not create barrel files (index.ts that re-export from other modules).
  Barrel files defeat tree-shaking, hide import origins, cause circular dependencies,
  and expand the importable surface beyond what should be public.
metadata:
  tags: javascript, typescript, imports, barrel-files, tree-shaking, performance
---

# Do not use barrel files (index.ts re-exports)

A barrel file is an `index.ts` that re-exports symbols from sibling modules to shorten import paths.
The convenience is real but short-lived; the costs compound as the codebase grows.

## Banned patterns

| Pattern | Problem |
|---|---|
| `export * from './foo'` in `index.ts` | Bundler loads `foo` even when caller uses none of its exports; tree-shaking fails without `sideEffects: false` |
| `export { A, B, C } from './foo'` in `index.ts` | Hides true origin of `A`; Ctrl+Click resolves to barrel, not source |
| `import { X } from '.'` (self-referencing barrel) | Circular dependency — module imports itself through its own index |
| Multiple `export *` barrels re-exporting the same name | Silent resolution conflict; which module owns `a`? |

## Use instead

Import directly from the source module:

```diff
- import { UserService } from '../services';
+ import { UserService } from '../services/user.service';
```

```diff
- // services/index.ts
- export * from './user.service';
- export * from './order.service';
- export * from './payment.service';
+ // Delete services/index.ts — import each service directly
```

Readable imports are the IDE's job (auto-import, path aliases), not a file you maintain by hand.

## Why barrels are harmful

**Dead modules in bundles** — Bundlers can tree-shake unused exports, but only remove entire modules when guaranteed `"sideEffects": false`. Without that guarantee, a barrel re-exporting `./A` and `./B` forces the bundler to load both even when only `A` is used.

**Opaque imports** — `import { a } from './lib'` hides where `a` lives. If two `export *` barrels both export `a`, resolution errors appear. IDE features degrade: Go-to-Definition lands on the barrel, auto-refactors (Move to file, Rename) break.

**Circular dependencies** — A file that does `import { X } from '.'` instead of the direct path creates a cycle through its own barrel. Common enough that NestJS documents barrel-induced circular deps with dedicated workarounds.

**Import surface too wide** — Barrels make every re-exported symbol importable from everywhere: internal helpers, test utilities, modules that should stay private. This is how `faker` ends up in a client bundle.

## Real-world impact

| Case | Before | After | Reduction |
|---|---|---|---|
| Next.js pages (module count) | 11,000 modules | 3,500 modules | -68% |
| Tooling tasks (various) | baseline | — | 60-80% faster |

The problem is systemic enough that Next.js shipped `optimizePackageImports` and Rolldown (Vite bundler) added a dedicated Lazy Barrel Optimization. Both mitigations require a pure barrel marked side-effect-free — proving the default case is already broken.

## Exceptions

- **Public entry point of an npm package** — a single `index.ts` at package root is conventional. Prefer the `exports` field in `package.json` with sub-path exports (`"./utils"`, `"./types"`) over a monolithic barrel.
- **Truly inseparable concepts** — a type, its type guard, and its factory that are always used together may share a barrel. Should be rare: 2-3 exports, single concept.

## ESLint enforcement

```json
"import/no-cycle": "error"
```

No off-the-shelf rule bans barrels outright. `import/no-cycle` catches the most damaging symptom. For stricter enforcement, use dependency-cruiser to forbid `index.ts` re-export patterns architecturally.

## Sources

- Jason Miller (@_developit), "So you think you know Barrel Files": https://x.com/_developit/status/1842225012092104732
- TkDodo, "Please Stop Using Barrel Files": https://tkdodo.eu/blog/please-stop-using-barrel-files
- Marvin Hagemeister, "Speeding Up the JS Ecosystem Part 7": https://marvinh.dev/blog/speeding-up-javascript-ecosystem-part-7/
- NestJS, Circular Dependency: https://docs.nestjs.com/fundamentals/circular-dependency
