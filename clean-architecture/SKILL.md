---
name: clean-architecture
description: >
  Design, implement, or review Clean Architecture in a .NET application: preserve
  inward dependencies, assign code to Domain, Application, Infrastructure, and
  Presentation, and decide when the structure is worth its cost. Use for Clean
  Architecture or domain-centred layering; use ports-adapters-architecture for
  a specifically hexagonal/ports-and-adapters request.
---

# Clean Architecture

Clean Architecture protects business rules from frameworks, databases, and delivery
mechanisms. It is a boundary for a complex domain, not a mandatory project template.

## Start with the fit

Use it when business rules are substantial, need independent tests, or must survive
changing delivery and integration details. Keep a simple feature-oriented design for
prototypes, short-lived applications, and CRUD with little domain logic; do not add
projects, mappings, or interfaces merely to resemble the diagram.

## Apply or review it

1. Locate the business rules and use cases; move framework, database, transport, and
   vendor details outward.
2. Enforce the dependency rule in project/package references: source dependencies
   point inward only.
3. Let an inner layer own an abstraction only when it needs an external capability;
   the outer layer implements it. Compose concrete implementations at the outer edge.
4. Keep the entry point thin: translate input, invoke a use case, translate output.
5. Add the smallest architecture test or build rule that prevents an inward-boundary
   violation when the repository needs durable enforcement.

## Read on demand

| Read when                                                            | Reference                                    |
| -------------------------------------------------------------------- | -------------------------------------------- |
| Deciding whether the structure earns its cost                        | [Why Clean Architecture](references/why.md)  |
| Applying the dependency rule, dependency inversion, DI, or CQRS      | [Core concepts](references/core-concepts.md) |
| Placing code in Domain, Application, Infrastructure, or Presentation | [Layers](references/layers.md)               |

## Source material

This skill combines Robert C. Martin's [original Clean Architecture article](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) and [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html), Milan Jovanović's practical [.NET guide](https://milanjovanovic.tech/blog/clean-architecture-dotnet), and Khalil Stemmler's [Clean Architecture articles](https://khalilstemmler.com/articles/tags/clean-architecture/).
