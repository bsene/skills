# Python Web Development

Primary references: <https://docs.djangoproject.com/>, <https://fastapi.tiangolo.com/>, <https://flask.palletsprojects.com/>, <https://asgi.readthedocs.io/>. Check the project's pinned framework version before using newer APIs.

## Pick the stack from the repo, not from taste

| Signal in repo                     | Stack      | Default stance                                                          |
| ---------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `manage.py`, `settings.py`         | Django     | Batteries included: ORM, admin, auth, migrations. Stay inside its grain |
| `FastAPI(`, Pydantic models        | FastAPI    | Typed JSON APIs; validation and OpenAPI come from the type hints        |
| `Flask(__name__)`, blueprints      | Flask      | Micro-framework; add extensions deliberately, use the app factory       |
| `Starlette`, `Litestar`, `aiohttp` | ASGI/async | Follow the existing async conventions                                   |

New project without constraints: Django for server-rendered apps with an admin; FastAPI for typed API services.

## WSGI vs ASGI

- WSGI (sync): gunicorn, uWSGI. ASGI (async): uvicorn, hypercorn, granian.
- Run ASGI apps with `uvicorn` behind a process manager or `gunicorn -k uvicorn_worker.UvicornWorker`; scale with worker processes, not threads.
- One blocking call in an `async def` handler stalls every request on that worker; see [concurrency](concurrency.md).

## Rules that hold across frameworks

1. **Validate at the boundary.** Parse request data into typed models (Pydantic, Django forms/serializers); never trust `request.json()` or `request.GET` raw.
2. **Thin handlers.** Views only translate HTTP to a service function and back; business logic lives in plain, testable functions.
3. **Config from the environment** (`pydantic-settings`, `os.environ`, `django-environ`); no secrets in the repo; `DEBUG` off by default.
4. **Dependency injection over globals.** FastAPI `Depends`, Flask app factory, Django settings; makes tests overrideable.
5. **Explicit status codes and error shapes.** Raise `HTTPException` / `Http404` / DRF exceptions; return one consistent error body.
6. **Log with `logging`** and a request ID; never log credentials or full payloads.

## Data and ORM

| Pitfall                                | Fix                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------- |
| N+1 queries                            | Django `select_related` / `prefetch_related`; SQLAlchemy `selectinload` |
| Schema changed without a migration     | Django `makemigrations`; Alembic `revision --autogenerate`, then review |
| Multi-step write without a transaction | `transaction.atomic()` / SQLAlchemy session scope                       |
| Unbounded list endpoint                | Paginate by default; cap `limit`                                        |
| Sync ORM call in an async handler      | Async driver/session, or `run_in_threadpool` / `sync_to_async`          |
| Raw SQL with string formatting         | Parameterized queries only                                              |
| Session shared across requests/tasks   | One session per request, closed in a dependency or middleware           |

## Security checklist

- CSRF protection on cookie-authenticated, state-changing routes (Django default; add it in Flask).
- CORS: explicit origins, never `*` with credentials.
- Hash passwords with the framework (Django, `argon2-cffi`, `bcrypt`); never roll your own.
- Auth tokens: short-lived JWT or server sessions; verify signature, `exp`, and audience.
- Set `ALLOWED_HOSTS`, secure/HttpOnly/SameSite cookies, and HTTPS-only in production (`manage.py check --deploy`).
- Escape output (Jinja2 and Django templates autoescape; avoid `|safe` / `mark_safe` on user data).
- Uploads: validate type and size, store outside the web root, randomize filenames.

## Background work

- Short, fire-and-forget: FastAPI `BackgroundTasks`.
- Durable or scheduled: Celery, RQ, Dramatiq, or Arq with a broker; make tasks idempotent and pass IDs, not objects.
- Never run long work inside the request cycle.

## Testing

- Django: `pytest-django`, `client` fixture, `django_assert_num_queries`.
- FastAPI: `TestClient` (sync) or `httpx.AsyncClient` with `ASGITransport`; override dependencies with `app.dependency_overrides`.
- Flask: `app.test_client()` from the app factory.
- Use a real database (SQLite in-memory or a container) over mocking the ORM; see [testing-with-pytest](testing-with-pytest.md).

## Beyond the web

The same discipline applies to adjacent domains: CLIs (`argparse`, `typer`, `click`), data work (`pandas`/`polars` with typed schemas, `pyarrow`), automation scripts (`subprocess.run(check=True)`, `pathlib`), and scraping (`httpx` + `selectolax`/`beautifulsoup4`, respect `robots.txt` and rate limits). Keep I/O at the edges and logic in pure functions.

Further reading: Real Python, <https://realpython.com/> (search "Django FastAPI Flask").
