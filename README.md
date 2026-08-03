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

The AI Script Assistant, the AI Thumbnail Creator's CTR analysis, the AI SEO Engine, the AI Caption Generator, the AI Clip Generator, the AI Publishing Hub's format optimizer, the AI Growth Coach, the Comment Manager, the Sponsor Manager's report generator, the Revenue Dashboard's report generator, and the AI Video Editor's edit plan generator need a real Anthropic API key — set `ANTHROPIC_API_KEY` in `backend/.env` (or export it before `docker compose up`). Without it, those features return a 503; everything else works.

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
| AI Video Editor | Real project CRUD; live Claude-generated edit plan (cut list, scene plan, platform notes) from a footage description or transcript — no actual video/audio processing (that would require real ffmpeg/computer-vision infrastructure, out of scope for an LLM call) |
| AI Thumbnail Creator | Live CTR analysis (Claude vision) + title suggestions; image generation not yet built |
| AI Script Assistant | Live (Claude API — script/hook/storytelling/CTA generation) |
| AI SEO Engine | Live metadata generation (Claude API — title/description/tags/hashtags/chapters/keywords); no live trends or ranking data |
| AI Caption Generator | Live (Claude API) — transcript to timed, translatable caption cues + .srt export; no audio/video transcription |
| AI Clip Generator | Live (Claude API) — transcript to ranked, quotable clip candidates + platform captions; no audio/video analysis |
| AI Publishing Hub | Live format optimization (Claude API) — one piece of content adapted per platform; no real OAuth/upload/scheduling yet |
| Creator Dashboard / Analytics | UI shell, mock data |
| AI Growth Coach | Live (Claude API) — tailored content ideas, priorities and diagnosis from what you tell it; no real analytics/trend data |
| Brand Kit | UI shell, mock data |
| AI Audio Studio | UI shell, mock data |
| Content Calendar | UI shell, mock data |
| AI Idea Vault | Live (Postgres-backed CRUD) — capture ideas, turn any of them into a real script via the Script Assistant; no automatic Reddit/RSS/News collection |
| Comment Manager | Live (Claude API) — real sentiment/spam classification + AI reply drafts on pasted comments; no platform connections |
| Sponsor Manager | Live (Postgres-backed CRUD) — track real deals/deadlines/payments, generate a real report (Claude API) from your actual data |
| Revenue Dashboard | Live (Postgres-backed income log) — manual income entries plus automatic Sponsorships stream from Paid sponsor deals, real aggregated breakdown, generate a real report (Claude API) from your actual data |
| Cloud Storage | Live (Postgres-backed file records + real uploads/downloads stored on the backend server's disk) — real per-folder breakdown and quota; not backed by a third-party cloud provider (S3, GCS, etc.) |

## More coming soon...
