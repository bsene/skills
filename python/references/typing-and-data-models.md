# Typing and Data Models

## Type hints

- Use builtin generics (`list[int]`, `dict[str, int]`) and `X | None` (3.10+); avoid `typing.List`/`Optional` in new code.
- `from __future__ import annotations` defers evaluation on older versions.
- Accept abstract inputs (`Sequence`, `Mapping`, `Iterable` from `collections.abc`); return concrete types.
- `Protocol` for structural interfaces; `TypedDict` for dict-shaped JSON; `Literal` for fixed values; `Final` for constants.
- `TypeVar` / PEP 695 syntax (`def first[T](xs: Sequence[T]) -> T`, 3.12+) for generics; `Self` (3.11+) for fluent returns.
- Prefer `object` or a Protocol to `Any`; use `cast` sparingly and `# type: ignore[code]` with a reason.
- Run `mypy --strict` or `pyright` in CI; adopt gradually per module.

## Data models

| Need                               | Use                                                  |
| ---------------------------------- | ---------------------------------------------------- |
| Plain record, internal             | `@dataclass(frozen=True, slots=True)`                |
| Mutable defaults                   | `field(default_factory=list)`                        |
| Fixed constants/choices            | `enum.Enum` / `StrEnum` (3.11+)                      |
| Lightweight immutable tuple        | `NamedTuple`                                         |
| Untrusted input needing validation | A validation library (e.g. pydantic) at the boundary |

- Validate at boundaries, then pass typed objects inward; use `__post_init__` for invariants.
- Don't subclass `dict`/`list`; compose or use `collections.UserDict`.
