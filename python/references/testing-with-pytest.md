# Testing with pytest

- Plain `assert`; pytest rewrites it to show values. Files `test_*.py`, functions `test_*`, run `pytest -x -q` then the full suite.
- Name tests by behavior (`test_rejects_negative_amount`); one reason to fail each; arrange-act-assert.
- Fixtures (`@pytest.fixture`) for setup/teardown with `yield`; share via `conftest.py`; scope widened only when setup is costly.
- `@pytest.mark.parametrize("a,b,expected", [...], ids=[...])` instead of loops.
- Exceptions: `with pytest.raises(ValueError, match="...")`. Floats: `pytest.approx`.
- Built-in fixtures: `tmp_path`, `monkeypatch`, `capsys`, `caplog`.
- Mock at the boundary you own (`unittest.mock.patch` where the name is looked up, `autospec=True`); prefer fakes over deep mock chains.
- Mark slow/integration tests (`@pytest.mark.slow`) and register markers in `pyproject.toml`.
- Coverage (`pytest --cov`) finds gaps; do not chase the number. Property tests with `hypothesis` for parsers and invariants.
- Async tests need the project's plugin (`pytest-asyncio` or `anyio`).
