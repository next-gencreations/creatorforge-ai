# CreatorForge AI — Backend

FastAPI + PostgreSQL API. Currently implements authentication and project
management; the AI processing pipelines (editing, thumbnails, SEO, etc.)
described in the product brief are not yet implemented and are served as UI
previews on the frontend until real workers/model integrations land.

## Run locally with Docker

```bash
docker compose up --build
```

This starts Postgres on `5432` and the API on `8000`.

## Run locally without Docker

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then point DATABASE_URL at a running Postgres instance
uvicorn app.main:app --reload
```

Tables are created automatically on startup (no Alembic migrations yet —
add them before this goes to production).

## API surface

- `POST /auth/register` — create an account, returns a JWT
- `POST /auth/login` — returns a JWT
- `GET /auth/me` — current user (requires `Authorization: Bearer <token>`)
- `GET /projects` — list the current user's projects
- `POST /projects` — create a project
- `PATCH /projects/{id}` — update title/status/platform targets
- `DELETE /projects/{id}` — delete a project
- `GET /health` — health check
