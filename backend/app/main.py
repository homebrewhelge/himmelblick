import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .cache import close_redis, get_redis
from .config import settings
from .http_client import close_client
from .routers import misc, weather

logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("HimmelBlick Backend startet …")
    try:
        r = await get_redis()
        await r.ping()
        logger.info("Redis-Verbindung OK")
    except Exception as e:
        logger.warning(f"Redis nicht erreichbar beim Start: {e}")

    print("\n  HimmelBlick gestartet → http://localhost\n", flush=True)
    yield
    # Shutdown
    logger.info("HimmelBlick Backend fährt herunter …")
    await close_client()
    await close_redis()


app = FastAPI(
    title="HimmelBlick API",
    description="Wetter-API für HimmelBlick",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(misc.router)
