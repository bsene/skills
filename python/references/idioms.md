# Idioms

## Iteration and data

- Iterate directly: `for item in items`; use `enumerate(xs, start=1)` and `zip(a, b, strict=True)` (3.10+) instead of index arithmetic.
- Comprehensions for simple map/filter; switch to a loop once it needs two clauses plus a condition or side effects.
- Generator expressions (`sum(x*x for x in xs)`) avoid building lists; write `def` + `yield` for lazy pipelines and `yield from` to delegate.
- `collections`: `defaultdict`, `Counter`, `deque`, `namedtuple`; `itertools`: `chain`, `groupby` (sort first), `islice`, `batched` (3.12+).
- Unpacking: `a, *rest = xs`, `{**d1, **d2}`, `d1 | d2` (3.9+). Walrus `:=` only when it removes duplication.
- `match` (3.10+) for structural dispatch on shape; keep plain `if` for simple value tests.

## Functions

- Keyword-only (`*,`) and positional-only (`/`) markers make APIs harder to misuse.
- Return early; avoid flag arguments. Use `functools.cache` / `lru_cache` for pure, hashable-argument functions.
- Decorators: always apply `functools.wraps`; take parameters via an outer factory.

## Resources and errors

- Context managers (`with`) own cleanup; write one with `contextlib.contextmanager` or `__enter__`/`__exit__`; `ExitStack` for dynamic sets.
- EAFP (try/except) for races and optional keys; LBYL when the check is cheaper and clearer.
- Custom exceptions subclass `Exception` (or a package base) and carry context; chain with `raise X from e`.
- Use `ExceptionGroup` / `except*` (3.11+) only for concurrent failures.

## Classes

- Start with functions and plain data; add a class when state and behavior travel together.
- Define `__repr__` for debugging; implement `__eq__` with `__hash__` consistently (or use a frozen dataclass).
- Prefer composition; use `@property` for computed attributes, not boilerplate getters.
- Use `__slots__` only for measured memory pressure.

## Strings and I/O

- f-strings for formatting; `!r` in logs and errors. Use `str.join`, not `+=` in loops.
- Pass `encoding` explicitly; `json`, `csv`, `tomllib` (3.11+) from the stdlib; `secrets` (not `random`) for tokens.
