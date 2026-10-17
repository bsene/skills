---
name: the-architect
description: >
  Design, implement, or review architecture boundaries using Clean Architecture,
  Ports and Adapters (Hexagonal), or Functional Core / Imperative Shell. Use for
  inward dependencies, domain-centred layering (including .NET), inbound/outbound
  ports, adapters, and isolating business policy from frameworks and infrastructure.
  Not for a local refactor without an architectural boundary or abstract OOP/SOLID questions.
---

# The Architect

These approaches share one goal: make business policy independent of volatile
mechanisms. Choose the smallest boundary that protects the actual complexity.

| Need                                                                 | Use                                | Read                                                                                 |
| -------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| A domain-centred system with inward dependencies and explicit layers | Clean Architecture                 | [Clean Architecture](references/clean-architecture.md)                               |
| Explicit inbound and outbound contracts around a business core       | Ports and Adapters                 | [Ports and Adapters](references/ports-adapters.md)                                   |
| A functional codebase, or a small boundary around effects            | Functional Core / Imperative Shell | [Functional Core / Imperative Shell](references/functional-core-imperative-shell.md) |

## Apply the boundary

1. Name the use case and the business rule it protects. If the change is simple CRUD
   or short-lived, keep it feature-oriented instead of introducing a framework.
2. Move the rule to the core. Do not let it import the web framework, database, SDK,
   clock, filesystem, or message broker. Keep project/package dependencies pointing inward.
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

## More references

| Need                                                                               | Read                                                                                                      |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Test behaviour through use-case ports with fakes; test pyramid; test-first order   | [Testing Through Ports](references/testing-through-ports.md)                                              |
| Repository, Unit of Work, aggregates, commands vs events, message bus, read models | [Application Patterns](references/application-patterns.md)                                                |
| Who owns port interfaces, configurator / composition root, cost of adopting        | [Configurator and Required Interfaces](references/ports-adapters/configurator-and-required-interfaces.md) |

## Reference scope

Read only the reference for the chosen approach; read both when comparing them.
The Clean Architecture reference retains its .NET layer guidance, and the Ports and
Adapters reference retains its TypeScript example and NestJS boundary-enforcement patterns.
