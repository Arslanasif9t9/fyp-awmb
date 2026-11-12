import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .routers import admin, auth, worlds

settings = get_settings()
log = logging.getLogger("awmb")

if settings.jwt_secret == "change_me" or len(settings.jwt_secret) < 32:
    log.warning("JWT_SECRET is weak. Use a long random string (32+ characters).")

app = FastAPI(
    title="AI World Model Builder API",
    description="Turns mixed data into a persistent, evidence-tagged world.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(
        {settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"}
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(worlds.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health", tags=["System"])
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(
            status_code=503, content={"status": "degraded", "database": "down"}
        )
    return {"status": "ok", "database": "ok", "version": app.version}
