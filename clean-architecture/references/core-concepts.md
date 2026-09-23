# Core Concepts

## Dependency rule

Source-code dependencies point inward. An inner layer must not import an outer layer,
its framework packages, or its concrete types. Runtime control may travel outward;
compile-time references may not.

Inner circles express higher-level policy; outer circles are lower-level mechanisms.
The rule applies to every named dependency and data format, not only project
references. A framework-generated type in a use case is an outward dependency too.

```
Presentation ──► Application ──► Domain
      │                ▲
      └─ composition ──┴── Infrastructure implements inner contracts
```

An application handler can call a repository at runtime without referencing its
database implementation: it references an interface owned by an inner layer, and the
outer implementation is selected at composition time.

## Crossing a boundary

Use a port owned by the inner policy when control must cross outward. The outer
adapter implements that port, so runtime control can go outward while source
dependencies still point inward. Apply the same pattern to input and output ports;
the direction of a call does not decide the direction of a source dependency.

Pass a small, boundary-specific data structure in the form most convenient for the
inner layer. Do not pass database rows, ORM queries, HTTP request models, or framework
responses inward. Likewise, do not use an entity as a generic transport DTO merely to
avoid a mapping.

## Dependency inversion

Define a contract beside the policy that needs it, only when that policy needs an
external capability. Infrastructure implements the contract. This is not an excuse to
wrap every library: a one-off abstraction with no boundary to protect is ceremony.

Do not leak outer types across the boundary. Return a domain object or an
application-owned response model, not an ORM query, HTTP response, or SDK type.

## Composition root

The outermost application (for example, the API startup code) may reference all
layers to register implementations and construct the object graph. That is where
framework configuration and dependency injection belong. Domain objects should
receive collaborators as parameters; they must not resolve services from a container.

## Optional patterns

CQRS and MediatR can organize use cases and cross-cutting behavior, but neither is a
requirement of Clean Architecture. Commands, queries, application services, or small
handler interfaces are valid if they preserve the dependency rule.

## Clean Architecture and DDD

Clean Architecture defines how dependencies and application boundaries are arranged;
Domain-Driven Design supplies modelling tools for the domain within those boundaries.
Treat a use case and an application service as equivalent roles when they coordinate
work. Keep domain invariants in entities, value objects, or a domain service when the
rule spans multiple entities; do not bury a reusable rule in one use-case handler.

Sources: [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), [The Dependency Rule in Clean Architecture](https://milanjovanovic.tech/blog/dependency-rule-clean-architecture), [Comparison of DDD and Clean Architecture Concepts](https://khalilstemmler.com/articles/software-design-architecture/domain-driven-design-vs-clean-architecture/).
