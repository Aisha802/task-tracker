from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_db_and_tables
from app.routers import auth, tasks

app = FastAPI(
    title="Task Tracker API",
    description="A small task-tracking API with JWT auth, built with FastAPI + SQLModel.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
