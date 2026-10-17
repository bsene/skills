# Configurator and Required Interfaces

## Who owns the interface

- A driven port (required interface) is declared by the application, in terms the
  application needs (`ForGettingTaxRates.taxRate(amount)`), not in terms of the table or
  API behind it. The adapter implements it; the source dependency points at the app.
- A driving port (provided interface) is also owned by the app; the UI or test calls it.
- Name ports by purpose ("for getting tax rates", "for notifying subscribers"). One port
  may hold several related calls but should serve one purpose.
- Dynamic languages need no declaration; the same rule holds by convention.

## The configurator

The one place that decides which adapter fills each port. It is the composition root:

| Style                          | How                                                           | Pick when                                          |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------- |
| Constructor / setter injection | Main or a test passes adapters in                             | Default; adapters fixed at startup                 |
| Lookup through a broker        | App asks a registry for the adapter (per country, per tenant) | Adapter must change at runtime or vary per request |

- Only the configurator imports concrete adapters. Tests use their own configuration with
  fakes; production uses real ones; no source change between the two.

## Cost check before adopting

Each driven port costs a field, an injection point, a declared interface, a folder for
port declarations, and the configurator. It pays off when you need to run without UI or
database, swap technology over time, link apps together, or keep UI and persistence logic
out of the business rules. For a short-lived or single-technology tool, it does not.

Source: Cockburn, "Hexagonal Architecture (Ports and Adapters), the 2023 version"
(Budapest talk).
