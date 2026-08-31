<!-- Reference rule, reached only via typescript/SKILL.md's rules table. No skill-style frontmatter needed. -->
<!-- tags: typescript, declaration files, ambient declarations, javascript interop -->

# Prefer typed JavaScript interoperability

Type definitions describe existing runtime code; they do not create it. Reference: [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html).

## Order of preference

1. Use types shipped by the package (`package.json` `types`/`exports`).
2. Install the community declaration: `npm i -D @types/<package>`.
3. Write a minimal local declaration for the consumed surface and grow only as usage grows.

## Banned pattern

```typescript
// Bad — unbounded dynamic access and no contract
declare const legacyClient: any;
legacyClient.doAnything();
```

## Use instead

```typescript
// types/legacy-client.d.ts
declare module "legacy-client" {
  interface LegacyClient {
    getUser(id: string): Promise<UserDTO>;
  }
  export default LegacyClient;
}
```

## Guidance

- Never model a dependency as `any` merely to stop compiler output.
- Declare only the API you actually use; avoid speculative methods.
- Split large declarations into interfaces.
- Update declarations when runtime code changes, and remove dead declarations.
- Treat the declaration and runtime call as one review unit — the compiler cannot prove the runtime shape exists.
