from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, captions, clips, projects, publishing, scripts, seo, thumbnails
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models import project, user  # noqa: F401 — ensure models are registered before create_all

app = FastAPI(title="CreatorForge AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(scripts.router)
app.include_router(thumbnails.router)
app.include_router(seo.router)
app.include_router(captions.router)
app.include_router(clips.router)
app.include_router(publishing.router)
