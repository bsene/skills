# Law of Demeter (c2 wiki)

Rule: only talk to your immediate friends. Original paper: Lieberherr et al., OOPSLA 1988.

A method may call methods on:

1. its own class (`this`)
2. its own fields (but not the fields' fields)
3. its parameters
4. objects it creates locally

It should not call methods on globals, nor chain through returned objects (`a.getB().getC().doSomething()`) outside `a`'s own class.

```java
// Smell: reaches through two objects
order.getCustomer().getAddress().getCity();
// Better: ask the owner (see tell-dont-ask.md)
order.shippingCity();
```

## Notes

- Payoff comes at refactoring time: fewer classes know the internals of others.
- Mock-object style tests push code toward the Law, since each extra collaborator must be mocked (Mackinnon, Freeman, Craig, XP2000).
- Caveat debated on the wiki: wrapping every chain in a delegating method just moves the coupling. Fluent builders and pure data access are not violations.
- Companion: [tell-dont-ask.md](tell-dont-ask.md), [object-calisthenics.md](object-calisthenics.md) (one dot per line).

Source: https://wiki.c2.com/?LawOfDemeter
