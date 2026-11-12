# Programming Elixir ≥ 1.6 (Dave Thomas) — Study Notes

Original condensed notes (not a reproduction) from _Programming Elixir ≥ 1.6_ (Pragmatic Bookshelf, 2018). The book's thesis is that programming is about transforming data, not managing state. It was written in the Elixir 1.6 era; see [Stale Parts](#stale-parts) for what has moved on. The core rules live in [SKILL.md](../SKILL.md); this file adds the decisions the book spells out.

## Chapter Map

| Part / Ch | Topic                                              | Notes                                                                 |
| --------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| 1 · 2–3   | Pattern matching, immutability                     | SKILL.md core idioms                                                  |
| 1 · 4–6   | Types, anonymous and named functions, guards, pipe | SKILL.md core idioms                                                  |
| 1 · 7–8   | Lists and recursion, maps/keyword lists/structs    | [Choosing a Dictionary](#choosing-a-dictionary)                       |
| 1 · 10–11 | Enum/Stream/comprehensions, strings and binaries   | [Strings and Binaries](#strings-and-binaries)                         |
| 1 · 12    | Control flow, exceptions                           | [Errors](#errors)                                                     |
| 1 · 13–14 | Mix project walk-through (`issues` CLI), tooling   | [Project and Tooling](#project-and-tooling)                           |
| 2 · 15–16 | Processes, links/monitors, nodes                   | [Processes and Nodes](#processes-and-nodes)                           |
| 2 · 17–21 | GenServer, Supervisors, Applications, Tasks/Agents | [OTP Design](#otp-design)                                             |
| 3 · 22–24 | Macros, behaviours and `use`, protocols            | [Metaprogramming and Polymorphism](#metaprogramming-and-polymorphism) |
| 3 · 25    | Sigils, umbrella projects                          | [Project and Tooling](#project-and-tooling)                           |
| App. 1–2  | Exceptions in depth, typespecs/Dialyzer            | [Errors](#errors), [Project and Tooling](#project-and-tooling)        |

## Choosing a Dictionary

Answer these questions in order and stop at the first yes:

1. Do you need to pattern-match on the contents? → **map**
2. Do you need duplicate keys? → **keyword list**
3. Does element order matter? → **keyword list** (this is why options are keyword lists)
4. Is the set of fields fixed? → **struct**
5. Otherwise → **map**

- For nested updates use `put_in/2`, `update_in/2` and `get_in/2` (or the `Access` path forms). Don't rebuild each level by hand with `%{outer | inner: %{...}}`.
- Don't turn a struct and its module into a class. Associating functions with a struct invites OO habits that mix paradigms; keep functions as transformations over data.

## Strings and Binaries

- Double quotes make a UTF-8 **binary** (a String). Single quotes make a **charlist**, a list of code points that Erlang APIs often expect. Convert at the boundary with `to_string/1` / `to_charlist/1`.
- `String.length/1` counts graphemes, `byte_size/1` counts bytes, and the two differ for non-ASCII text.
- Pattern match binaries to parse protocols and headers: `<<head::binary-size(4), rest::binary>>`.

## Errors

- Return `{:ok, v}` / `{:error, r}` when the caller can reasonably handle failure.
- Use `name!` when failure is a bug or should never happen; it raises a meaningful exception (`File.open!/1`).
- A bare `{:ok, f} = File.open(path)` crashes with a `MatchError`. That is acceptable for "can't happen" paths, but it gives operators less information than `!` or an explicit `raise`.
- Exceptions are rare in idiomatic code: Mix has no exception handlers at all. If you are about to define a new exception, consider isolating the risky work in its own supervised process instead.
- `throw`/`catch` is for non-local returns from legacy APIs, not control flow.

## Processes and Nodes

- Processes are cheap: the book's chain benchmark spawns hundreds of thousands. Model each concurrent activity as a process, not as a pool of threads.
- `spawn_link` when both sides should die together; `Process.monitor` when you only need to be told. Trap exits only in processes that supervise or clean up.
- Parallel map (spawn one process per element, then collect the replies in order) is the canonical "hello world". In modern code use `Task.async_stream/3`.
- Register a name (`Process.register/2`, `:global`, or a `name:` option) instead of passing PIDs through the whole system.
- Nodes (`iex --sname a`, `Node.connect/1`) are the unit of distribution, and the same `send` works across them. I/O goes to the group leader, so output from a remote spawn appears on the calling node.

## OTP Design

**Plan the application with five questions:**

1. What is the environment and what are its constraints?
2. What are the obvious focal points (the natural servers)?
3. What are the runtime characteristics: load, latency, how long state lives?
4. What must be protected from errors (supervision boundaries)?
5. How do I get it running (application, release)?

**GenServer:** expose a client API module that hides `GenServer.call/cast`, and keep the callbacks small. Once it works, extract the pure logic into its own module: server = process plumbing, implementation = pure functions you can test without processes.

**Supervisors:** think in "rings of confidence". The outer ring that touches the world must be robust; inner rings may fail as long as the ring above handles it. Per-worker `restart:` options:

| Option       | Restarted when        |
| ------------ | --------------------- |
| `:permanent` | Always (default)      |
| `:transient` | Only on abnormal exit |
| `:temporary` | Never                 |

Set it on the module (`use GenServer, restart: :transient`) or override it with `Supervisor.child_spec/2`. Keep crash-prone state outside the worker it would be lost with: the book's example parks the state in a separate stash process.

**Tasks, Agents or GenServer:** use the simplest one that works. Wrap a Task or Agent in your own module so you can switch to a GenServer later without touching callers.

**Applications:** an OTP application is closer to a shared library than an "app". `mod:` in `mix.exs` names the callback module, and its `start/2` returns the top supervisor.

## Metaprogramming and Polymorphism

- **Never use a macro when a function will do.** Application code rarely needs macros; libraries and DSLs do.
- Quoted code is plain data, `{name, meta, args}` tuples. Use `quote`/`unquote`, with `bind_quoted:` to avoid evaluating arguments twice. Macros are hygienic, and `var!/1` breaks hygiene on purpose (rarely needed).
- **Behaviours** (`@callback`, `@behaviour`, `@impl true`) are compile-checked contracts between modules. `use Mod` calls `Mod.__using__/1` to inject shared code, so keep the injected part thin.
- **Protocols** add polymorphism to types you don't own, including built-ins and other people's structs. Prefer them over type-checking `case` when extending a library's data. The built-ins worth implementing are `Inspect`, `String.Chars`, `Enumerable` and `Collectable`.
- The anthology's comparison (see [Elixir Books](elixir-books.md)) makes the same point: an Elixir protocol implementation is scoped to the protocol, so two protocols with the same function name don't clash. A Swift extension adds methods globally.

## Project and Tooling

- Walk-through shape (`issues` CLI): parse args → fetch → convert → sort → take → format. Each step is a pipeline stage with its own tests. Split a function as soon as it does two transformations.
- `mix escript.build` turns a project into a single-file CLI. Configure `Logger` levels per environment.
- Use `ExDoc` for docs; doctests keep `iex>` examples honest.
- In IEx, `h` shows docs and `i` inspects a value. `IEx.pry` / `break!` drop you into a running function, and `:observer.start()` shows processes, supervision trees and memory live.
- Test coverage: `mix test --cover`. Find dependencies between modules with `mix xref graph`.
- Typespecs: put `@spec` on public functions and `@type`/`@typep`/`@opaque` on your types, then check them with Dialyzer via `dialyxir`. The book calls specs optional; this skill's checklist requires them on public functions.
- Umbrella projects (`mix new --umbrella`) split one repo into several OTP apps under `apps/`. Use them when the boundaries are real, not for code organisation alone.
- Write a sigil (`sigil_x/2`) only for domain literals that read better than function calls.

## Stale Parts

- **Releases:** the book uses Distillery and hot upgrades. Since Elixir 1.9 use built-in `mix release` with `config/runtime.exs`; hot code upgrades are rarely worth the operational cost.
- **Config:** `Mix.Config` became `import Config`; read environment-specific secrets at runtime.
- **Types:** Elixir 1.17+ has a gradual set-theoretic type checker that warns on some type errors without specs. Dialyzer still adds value.
- **Libraries:** `HTTPoison`/`Poison` in the walk-through are superseded by `Req`/`Finch` and the stdlib `JSON` module (1.18+).
