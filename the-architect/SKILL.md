---
name: the-architect
description: >
  Choose and apply Clean Architecture, Ports and Adapters, or Functional Core /
  Imperative Shell to protect business policy from delivery and infrastructure
  details. Use for architecture-boundary design, implementation, and review;
  not for a small local refactor with no architectural boundary.
---

# The Architect

These approaches share one goal: make business policy independent of volatile
mechanisms. Choose the smallest boundary that protects the actual complexity.

| Need                                                                 | Use                                | Read                                                                                 |
| -------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| A domain-centred system with inward dependencies and explicit layers | Clean Architecture                 | [Clean Architecture](../clean-architecture/SKILL.md)                                 |
| Explicit inbound and outbound contracts around a business core       | Ports and Adapters                 | [Ports and Adapters](../ports-adapters-architecture/SKILL.md)                        |
| A functional codebase, or a small boundary around effects            | Functional Core / Imperative Shell | [Functional Core / Imperative Shell](references/functional-core-imperative-shell.md) |

## Apply the boundary

1. Name the use case and the business rule it protects. If the change is simple CRUD
   or short-lived, keep it feature-oriented instead of introducing a framework.
2. Move the rule to the core. Do not let it import the web framework, database, SDK,
   clock, filesystem, or message broker.
3. Define an inward-facing contract only when the core needs an external capability;
   implement it at the edge. In functional code, a plain function or returned effect
   description can be the contract.
4. Translate outer input into core data and translate core output at the edge. Never
   pass ORM rows, HTTP objects, or framework models through the core.
5. Test the policy without infrastructure. Add a boundary test only when the project
   needs lasting enforcement.

## Keep the names meaningful

The top-level structure should reveal the product's use cases and business concepts,
not primarily the web framework or ORM. Group code by feature or bounded capability
when that makes the policy easier to locate.

## Source material

This umbrella skill routes to the repository's [Clean Architecture](../clean-architecture/SKILL.md)
and [Ports and Adapters](../ports-adapters-architecture/SKILL.md) materials. Its
Functional Core / Imperative Shell reference is extracted from the latter.
