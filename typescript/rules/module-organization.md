<!-- Reference rule, reached only via typescript/SKILL.md's rules table. No skill-style frontmatter needed. -->
<!-- tags: typescript, module organization, namespaces, exports -->

# Use modules and named exports

Use explicit module boundaries and named exports so imports stay searchable and refactors stay safe. Reference: [Modules](https://www.typescriptlang.org/docs/handbook/modules.html).

## Banned patterns

```typescript
// Bad — namespace-based application organization
namespace Shipping {
  export class Ship {}
  export class Dock {}
}

// Bad — hidden identity and inferred import name
export default class UserService {}
```

## Use instead

```typescript
// shipping/ship.ts
export class Ship {}

// shipping/dock.ts
import { Ship } from "./ship";

export class Dock {
  dock(ship: Ship): void {}
}
```

## Rule

- Prefer named exports so imports survive refactoring and are searchable.
- Use `export default` only when a framework convention requires it (for example, a page component) and there is exactly one natural entry point.
- Do not mix namespaces with modules for application organization.
- Reserve `namespace` for legacy/ambient declarations and type augmentation, not as an application-scale container.
