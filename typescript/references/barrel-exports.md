# Barrel Exports

A barrel (`index.ts`) re-exports from multiple modules under a single import path.

## Pattern

Instead of:

```typescript
import { Foo } from '../domain/foo';
import { Bar } from '../domain/bar';
import { Baz } from '../domain/baz';
```

Create `domain/index.ts`:

```typescript
export * from './foo';
export * from './bar';
export * from './baz';
```

Then:

```typescript
import { Foo, Bar, Baz } from '../domain';
```

## Namespaced selective export

When a sub-module should be accessed as a namespace:

```typescript
// domain/index.ts
export * from './foo';
export * from './bar';
import * as validators from './validators';
export { validators };
```

```typescript
import { Foo, validators } from '../domain';
validators.isEmail(input);
```

## When to use

- Public API surface of a feature/module folder
- Shared domain types consumed across many files
- Library packages exposing a clean public API

## When NOT to use

- Within a feature folder if it would circular-import its own barrel
- When the barrel re-exports everything and adds no filtering — skip it if there's only one consumer
- Deep nesting (domain/sub/index.ts → domain/index.ts) can create circular import chains; flatten instead

## Tree-shaking note

Barrel exports can defeat tree-shaking in bundlers that don't support scope hoisting. For browser bundles, verify your bundler (Vite, webpack 5+, esbuild) handles `export *` correctly. Named exports from barrels are generally safe.
