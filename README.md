# CreatorForge AI

The AI-powered creator operating system.

CreatorForge is designed to automate the entire workflow for YouTubers, vloggers and content creators — from editing and publishing to analytics and monetisation.

> **Status:** early-stage build. Authentication and project management are live and backed by a real API/database. Every other feature area described in the product brief (AI video editing, thumbnails, SEO, captions, clip generation, publishing integrations, growth coaching, etc.) currently ships as a fully designed UI with sample data, ready to be wired up to real AI pipelines and platform integrations.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** FastAPI + PostgreSQL (SQLAlchemy)
- **Auth:** email/password with JWT

## Getting started

### 1. Backend

```bash
docker compose up --build
```

Starts Postgres and the API at `http://localhost:8000`. See [`backend/README.md`](backend/README.md) for running without Docker.

The AI Script Assistant needs a real Anthropic API key — set `ANTHROPIC_API_KEY` in `backend/.env` (or export it before `docker compose up`). Without it, that one feature returns a 503; everything else works.

### 2. Frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000`, sign up, and you'll land in the dashboard.

## Feature areas

| Area | Status |
| --- | --- |
| Auth & accounts | Live (FastAPI + Postgres + JWT) |
| Project management | Live (create/list/update/delete via API) |
| AI Video Editor | UI shell, pipeline not yet connected |
| AI Thumbnail Creator | UI shell, mock data |
| AI Script Assistant | Live (Claude API — script/hook/storytelling/CTA generation) |
| AI SEO Engine | UI shell, mock data |
| AI Caption Generator | UI shell, mock data |
| AI Clip Generator | UI shell, mock data |
| AI Publishing Hub | UI shell, mock data |
| Creator Dashboard / Analytics | UI shell, mock data |
| AI Growth Coach | UI shell, mock data |
| Brand Kit | UI shell, mock data |
| AI Audio Studio | UI shell, mock data |
| Content Calendar | UI shell, mock data |
| AI Idea Vault | UI shell, mock data |
| Comment Manager | UI shell, mock data |
| Sponsor Manager | UI shell, mock data |
| Revenue Dashboard | UI shell, mock data |
| Cloud Storage | UI shell, mock data |

## More coming soon...
