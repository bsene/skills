# Tooling and Packaging

## Environments

- One virtual environment per project: `python -m venv .venv` or `uv venv`; activate or call `.venv/bin/python`. Keep `.venv/` out of git.
- Run tools as `python -m pip` / `python -m pytest` so they match the interpreter.
- Pin applications (lock file: `uv.lock`, `pip-compile`, poetry.lock); give libraries loose lower bounds.

## `pyproject.toml`

- Single config home: `[project]` (name, version, `requires-python`, dependencies, optional-dependencies), `[build-system]`, and `[tool.*]` for ruff, pytest, mypy.
- Typical build backends: hatchling, setuptools, flit, or uv_build. Build with `python -m build`; publish with `twine` or `uv publish`.
- `src/` layout prevents accidentally importing the working tree; install editable with `pip install -e .`.
- Console scripts: `[project.scripts] name = "pkg.cli:main"`.

## Quality

- `ruff check --fix` and `ruff format` (or black + isort + flake8 if the project uses them); follow PEP 8 names: `snake_case`, `PascalCase`, `UPPER_CASE`.
- Pre-commit hooks or CI run lint, types, tests on every supported Python version.
- Entry points: `if __name__ == "__main__": main()`; parse args with `argparse` (or the project's CLI library).
- Config from environment variables; never commit secrets. Use `logging` configured once at the entry point.
- Docstrings state purpose, args, raises; follow the project's style (Google/NumPy/reST) consistently.
