---
name: elixir
description: >
  Write, review, and debug idiomatic Elixir — pattern matching, pipelines, immutable data, processes, OTP (GenServer, Supervisor, Task, Agent), Mix projects, and ExUnit.

  TRIGGER when: Elixir, .ex/.exs files, mix.exs, mix test, iex, `|>` pipe operator, pattern matching on tuples/maps/lists,
  with/case/cond, GenServer, Supervisor, Task, Agent, spawn/send/receive, let it crash, OTP application, ExUnit, doctest,
  Enum/Stream, protocols, behaviours, `{:ok, v}`/`{:error, r}` tuples, or "how do I do X in Elixir".
  DO NOT USE for Erlang-only code, Phoenix/Ecto specifics beyond the language, or other BEAM languages (Gleam, LFE).
metadata:
  user-invocable: "false"
---

# Elixir

Functional language on the BEAM VM: immutable data, lightweight isolated processes, fault tolerance via supervision. Source: _Programming Elixir >= 1.6_ (Dave Thomas, Pragmatic Bookshelf); paraphrased, see the book for depth.

## Core idioms

| Idea                           | Rule                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `=` is a match, not assignment | Left side is a pattern; rebinding is allowed, use `^x` to pin an existing value                                                   |
| Multi-clause functions         | Prefer several heads with patterns/guards over `if` chains; order matters, put specific clauses first                             |
| Pipelines                      | `data \|> f() \|> g(arg)` — first argument flows through; keep each step a pure transform                                         |
| Tagged results                 | Return `{:ok, value}` / `{:error, reason}`; `!` variants raise                                                                    |
| `with`                         | Chain happy-path matches; the first non-matching value falls out (or goes to `else`)                                              |
| Data                           | Lists are linked (prepend `[h \| t]`, avoid `++` in loops), maps for key/value, structs for typed maps, keyword lists for options |
| Collections                    | `Enum` is eager, `Stream` is lazy; reach for `for` comprehensions with filters when mapping + filtering                           |
| Recursion                      | Make it tail-recursive with an accumulator, or just use `Enum.reduce/3`                                                           |
| Polymorphism                   | Protocols dispatch on data type; behaviours define a callback contract for modules                                                |

```elixir
defmodule Order do
  def total(%{items: items, discount: d}) when d > 0, do: sum(items) * (1 - d)
  def total(%{items: items}), do: sum(items)
  defp sum(items), do: items |> Enum.map(& &1.price) |> Enum.sum()
end

with {:ok, user} <- Users.fetch(id),
     {:ok, order} <- Orders.latest(user) do
  {:ok, Order.total(order)}
end
```

## Processes and OTP

- `spawn`/`send`/`receive` are the primitives; processes share nothing and talk by messages. `spawn_link` ties lifetimes; `Process.monitor` observes without dying.
- Do not hand-roll receive loops in production: use OTP abstractions.

| Need                                | Use                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| One-off async work                  | `Task.async/await`, `Task.Supervisor`                                                     |
| Simple shared state                 | `Agent`                                                                                   |
| Stateful server with call/cast/info | `GenServer` (client API functions wrap `GenServer.call/cast`; callbacks hold logic)       |
| Restart on failure                  | `Supervisor` with child specs; strategies `:one_for_one`, `:rest_for_one`, `:one_for_all` |
| Dynamic children                    | `DynamicSupervisor`                                                                       |
| Packaging and boot                  | OTP application (`mod:` in `mix.exs`, `Application.start/2` starts the supervision tree)  |

Principles: let it crash (do not defensively rescue; supervisors restore a known-good state), keep GenServer state small, never do blocking work inside a callback that other callers wait on, and design the supervision tree so dependents restart together.

## Mix and ExUnit

| Task                                | Command                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| New project / with supervision tree | `mix new app` / `mix new app --sup`                     |
| Deps                                | add to `deps/0` in `mix.exs`, then `mix deps.get`       |
| Test                                | `mix test`, `mix test path:LINE`, `--stale`, `--failed` |
| Format / compile warnings           | `mix format`, `mix compile --warnings-as-errors`        |
| REPL with project                   | `iex -S mix`                                            |

```elixir
defmodule OrderTest do
  use ExUnit.Case, async: true
  doctest Order

  test "discount applies" do
    assert Order.total(%{items: [%{price: 10}], discount: 0.5}) == 5.0
  end
end
```

- `async: true` only when tests share no global state; use `setup` for fixtures and `@tag` to filter.
- Put examples in `@doc` with `iex>` and run them with `doctest`.
- Test processes through their public API, not by inspecting internal state.

## Review checklist

1. Matches are exhaustive or intentionally crash; no `if` where a function head fits.
2. Pipelines start with a bare value and contain no side effects mid-chain.
3. No unsupervised long-lived `spawn`; GenServer calls have sane timeouts.
4. Errors are tagged tuples at boundaries; `!` only where failure is a bug.
5. `mix format` clean; specs (`@spec`) on public functions.
