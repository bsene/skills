# Elixir & Erlang Books — Curated Reading Map

Curated from the [elixir-lang.org learning page](https://elixir-lang.org/learning/), plus the Elixir chapters of _Functional Programming: A PragPub Anthology_. These notes are condensed and original; only the books marked 📖 were read for them. Start with the official guides: [Getting Started](https://hexdocs.pm/elixir/introduction.html) and [Mix and OTP](https://hexdocs.pm/elixir/introduction-to-mix.html).

**Not included:** beginner-to-programming titles (_Joy of Elixir_), courses, screencasts and exercise sites. Those are linked from the learning page.

## By Need

| Need                                 | Book                                                           | Why                                                                                   |
| ------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Learn the language as a programmer   | 📖 _Programming Elixir ≥ 1.6_ (Thomas)                         | [Programming Elixir Notes](programming-elixir-notes.md)                               |
| Build a real OTP system end to end   | _Elixir in Action_ (Jurić)                                     | Processes → GenServer → supervision → distribution → releases, built on one to-do app |
| Design OTP code well                 | _Designing Elixir Systems with OTP_ (Gray & Tate)              | Layering: data → functional core → tests → boundaries → lifecycle → workers           |
| Pipelines and back-pressure          | _Concurrent Data Processing in Elixir_ (Gospodinov)            | When to use Task, GenStage, Flow or Broadway                                          |
| Macros and DSLs                      | _Metaprogramming Elixir_ (McCord)                              | Write macros only for a library or DSL                                                |
| FP from scratch                      | _Learn Functional Programming with Elixir_ (Almeida)           | Recursion, higher-order functions, pipes; no OTP                                      |
| Team adoption, production lifecycle  | _Adopting Elixir_ (Marx, Valim, Tate)                          | Hiring, coding standards, deploy, metrics, ops                                        |
| Debug a production BEAM node         | _Erlang in Anger_ (Hébert, free)                               | The one Erlang resource the learning page lists                                       |
| FP across languages, Elixir chapters | 📖 _Functional Programming: A PragPub Anthology_ (Swaine, ed.) | Below                                                                                 |

## Takeaways

**Elixir in Action (Jurić).** Start from a pure functional abstraction (a module over a data structure), then wrap it in a server process, then supervise it. Keep each GenServer a single point of serialisation: if it becomes a bottleneck, split by key with a `Registry` plus `DynamicSupervisor` (one process per entity). Use ETS for read-heavy shared state. Ship with `mix release`.

**Designing Elixir Systems with OTP (Gray & Tate).** The layers are "Do Fun Things with Big, Loud Worker-Bees": **D**ata, **F**unctional core, **T**ests, **B**oundaries, **L**ifecycle, **W**orkers. Keep the core free of processes and side effects. Put validation and error handling at the boundary, and add processes only where you need concurrency or state lifetime. A GenServer is a boundary, not a place for business logic.

**Concurrent Data Processing in Elixir (Gospodinov).** `Task.async_stream/3` with `max_concurrency` is enough for bounded parallel work. Reach for GenStage when consumers must pull at their own rate (back-pressure), Flow for parallel map-reduce over large collections, and Broadway for message-queue ingestion (SQS, RabbitMQ, Kafka) with batching and acknowledgements.

**Metaprogramming Elixir (McCord).** Macros are a last resort: they cost readability and compile time. Generate functions at compile time from data (`for` + `def` inside `quote`), keep `__using__` thin, and test macros through the code they generate.

**Adopting Elixir (Marx, Valim, Tate).** Bring the team in through small, isolated services. Agree on `mix format`, Credo and Dialyzer on day one. Instrument with `:telemetry`, and plan releases and configuration before the first deploy.

**Erlang in Anger (Hébert).** For a live system: connect a remote shell, then look at message-queue lengths, memory per process, reductions and binary leaks with `recon`. Overload is the most common failure, so bound mailboxes and add back-pressure or load shedding. Trace carefully (`recon_trace` limits the output), never with unbounded `dbg` in production.

**PragPub Anthology, Elixir chapters.**

- _Patterns and Transformations_ / _Getting Functional_ (Thomas): `=` is a match and the only way to bind values. Programming is transforming data. Code with no `if` or loop that reads like its specification is the goal.
- _Getting Parallel_ (Thomas): spawn a process per unit of work and collect the replies.
- _Protocols in Swift vs. Ruby and Elixir_ (Valim): Elixir protocol implementations are scoped per protocol, unlike global monkey-patching or extensions, so independent libraries can't clash.
- _A Testing Framework_ / _Building Test Data_ (Tate): express test setup as small pipeable steps (the "story pipes" idea) so scenarios read as a sequence of facts. Generate plausible fake data from a central registry of entity templates instead of hand-building fixtures in every test.

## Erlang

There is no separate Erlang skill. For Erlang-only code, use the official [Erlang/OTP documentation](https://www.erlang.org/docs), especially its _OTP Design Principles_ guide, plus _Erlang in Anger_ for operations. _Learn You Some Erlang_ and Armstrong's _Programming Erlang_ are the standard tutorials. Elixir calls Erlang modules as atoms: `:ets.new/2`, `:timer.tc/1`.
