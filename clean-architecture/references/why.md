# Why Clean Architecture

## The problem it addresses

Business rules tend to acquire framework, database, HTTP, and vendor knowledge. A
change to any of those details then changes the rule itself and makes its tests depend
on an integration stack. Clean Architecture reverses that pressure: business policy
is the stable centre and volatile delivery or integration details sit outside it.

The benefits follow from that boundary, rather than from the number of projects:

- business rules can be tested without a database, web host, or remote service;
- external technology can change behind a contract the core owns;
- responsibilities are easier to find and modify independently.

## Choose it deliberately

It pays for itself when one or more of these are true:

- the domain has meaningful invariants, workflows, or policies;
- independent tests of business behavior matter;
- external integrations or delivery mechanisms are likely to change;
- the team needs enforceable dependency boundaries.

It is usually a poor fit for a prototype, a short-lived application, or uncomplicated
CRUD. In those cases, extra layers, mappings, and interfaces can obscure the feature
instead of protecting anything valuable.

## Let the structure reveal the product

At the top level, organize and name code so a new reader can identify the business
capabilities and use cases before they learn the web framework, ORM, or delivery
mechanism. A framework is a tool and the web is a delivery detail; neither should be
the theme of the architecture. This also keeps technology choices deferrable and
replaceable.

## Be pragmatic

The dependency rule is the invariant; ceremonial abstractions are not. For example,
a write use case may benefit from a repository contract that protects domain changes,
while a read-only projection can query directly when an extra repository would add
only indirection. State the trade-off at the call site or module boundary and do not
let the exception pull framework types into the Domain layer.

Sources: [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html), [Clean Architecture and the Benefits of Structured Software Design](https://milanjovanovic.tech/blog/clean-architecture-and-the-benefits-of-structured-software-design), [Why Clean Architecture Is Great for Complex Projects](https://milanjovanovic.tech/blog/why-clean-architecture-is-great-for-complex-projects).
