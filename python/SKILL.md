---
name: python
description: >
  Write, review, and debug idiomatic modern Python.

  TRIGGER when: Python, .py files, pyproject.toml, pip, uv, venv, pytest, type hints,
  mypy, pyright, ruff, dataclasses, generators, decorators, context managers, asyncio,
  async/await, comprehensions, f-strings, pathlib, logging, packaging, virtual environments,
  Pythonic code, PEP 8, PEP 484.

  DO NOT USE for framework specifics (Django, Flask, FastAPI, pandas, PyTorch) beyond
  the language and standard-library patterns here.
---

# Python

Primary reference: the official Python site, <https://www.python.org/> (documentation, PEP index, and downloads). Check the project's Python version before using newer syntax. For tutorial-style further reading, see <https://realpython.com/>; guidance here is original and paraphrased.

Be explicit, readable, and boring. Use the standard library first, type the public surface, and let tools enforce style.

## Route to references

| Need                                                   | Reference                                                      |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| Idioms: comprehensions, generators, decorators, dunder | [idioms](references/idioms.md)                                 |
| Type hints, dataclasses, protocols, mypy/pyright       | [typing-and-data-models](references/typing-and-data-models.md) |
| pytest, fixtures, parametrization, mocking             | [testing-with-pytest](references/testing-with-pytest.md)       |
| Venvs, `pyproject.toml`, uv/pip, ruff, packaging       | [tooling-and-packaging](references/tooling-and-packaging.md)   |
| `asyncio`, threads vs processes, the GIL               | [concurrency](references/concurrency.md)                       |

## Core workflow

1. Detect the interpreter and dependency tool (`pyproject.toml`, `uv.lock`, `requirements.txt`) and follow it; never `pip install` globally.
2. Prefer the standard library: `pathlib`, `dataclasses`, `enum`, `itertools`, `collections`, `logging`, `argparse`, `subprocess`.
3. Annotate function signatures; run the project's type checker and `ruff check` / `ruff format` (or its configured equivalents).
4. Raise specific exceptions; catch narrowly. Never use a bare `except:`; use `raise ... from err` to keep causes.
5. Verify with the project's tests before reporting done.

## Pitfalls

| Smell                                    | Fix                                                  |
| ---------------------------------------- | ---------------------------------------------------- |
| Mutable default argument (`def f(x=[])`) | Default `None`, create inside                        |
| Late-binding closure in a loop           | Bind with a default arg or `functools.partial`       |
| `open()` without `with` or encoding      | `with open(p, encoding="utf-8")` or `Path.read_text` |
| String paths via `os.path` joins         | `pathlib.Path` and `/`                               |
| `==` against `None`/`True`               | `is None`; test truthiness directly                  |
| `print` for diagnostics in libraries     | `logging.getLogger(__name__)`                        |
| Mutating a list while iterating          | Build a new list or iterate a copy                   |
| Blocking call inside `async def`         | `await` an async API or `asyncio.to_thread`          |
