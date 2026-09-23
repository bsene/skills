# Layers

The names are less important than dependency direction. A typical .NET solution has
these four responsibilities.

| Layer          | Owns                                                                                                                            | Must not know                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Domain         | entities, value objects, domain rules, domain events, domain services, domain errors                                            | HTTP, ORM/database configuration, logging, SDKs, queues       |
| Application    | use cases, commands/queries, orchestration, application contracts, response models                                              | concrete database, broker, cloud, or transport implementation |
| Infrastructure | persistence, external-service clients, messaging, and implementations of inner contracts                                        | presentation delivery details                                 |
| Presentation   | controllers/endpoints, request/response translation, authentication at the transport boundary, dependency-injection composition | business-rule implementation details                          |

## The original circles and a .NET solution

Martin's original circles name the responsibilities as **Entities**, **Use Cases**,
**Interface Adapters**, and **Frameworks & Drivers**. They do not require four
projects. A typical .NET layout maps Entities to Domain and Use Cases to Application;
adapters commonly live in Presentation (controllers, presenters) and Infrastructure
(persistence or external-service gateways). Frameworks, databases, and web servers
remain the outermost details. Keep an adapter next to the detail it translates, rather
than creating a project solely to match a diagram.

## Domain

Keep business invariants where they cannot be bypassed: entity operations and value
objects should reject invalid creation and state transitions. Keep it persistence
ignorant and free of framework packages and attributes. Repository contracts may live
here when they model aggregate persistence; placing them in Application is also valid.
Their implementations always belong outside.

## Application

Make a use case read as orchestration: load, invoke domain behavior, save, and return
an application result. Put request validation and use-case-specific policy here, not
inside controllers or ORM entities. It may coordinate external capabilities through
contracts it or the Domain layer owns. Group handlers, input/output models, and their
tests by business capability or use case when that makes the system easier to navigate,
rather than by framework or pattern name alone.

## Infrastructure

Put technology choices here: EF Core mappings and migrations, database repositories,
HTTP clients, object storage, message brokers, email, and their configuration. This
layer implements inner contracts; it does not move its types or concerns inward.

## Presentation

Treat HTTP, gRPC, CLI, jobs, and other delivery mechanisms as entry points. They
authenticate and translate input, call a use case, and translate its result. A
background job is another entry point, not a place for the use-case logic.

Sources: [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), [Clean Architecture in .NET](https://milanjovanovic.tech/blog/clean-architecture-dotnet), [The Domain Layer in Clean Architecture](https://milanjovanovic.tech/blog/domain-layer-clean-architecture), [Organizing App Logic with Clean Architecture](https://khalilstemmler.com/articles/software-design-architecture/organizing-app-logic/).
