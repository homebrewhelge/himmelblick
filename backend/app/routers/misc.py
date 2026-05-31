import logging
from datetime import date
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

from ..cache import cache_get, cache_set
from ..config import settings
from ..services import dwd, open_meteo
from ..services.astronomy import compute_astronomy
from ..services.geocoding import fetch_elevation, geocode, reverse_geocode

router = APIRouter(prefix="/api", tags=["misc"])
logger = logging.getLogger(__name__)


def _get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=settings.http_timeout)


@router.get("/air-quality")
async def get_air_quality(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> dict[str, Any]:
    key = f"air_quality:{lat:.4f}:{lon:.4f}"
    cached = await cache_get(key)
    if cached:
        return cached

    async with _get_client() as client:
        try:
            data = await open_meteo.fetch_air_quality(lat, lon, client)
        except httpx.HTTPError as e:
            logger.error(f"Luftqualität-Fehler: {e}")
            raise HTTPException(502, "Luftqualitätsdaten momentan nicht verfügbar")

    await cache_set(key, data, settings.ttl_air_quality)
    return data


@router.get("/marine")
async def get_marine(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> dict[str, Any]:
    key = f"marine:{lat:.4f}:{lon:.4f}"
    cached = await cache_get(key)
    if cached:
        return cached

    async with _get_client() as client:
        data = await open_meteo.fetch_marine(lat, lon, client)
        if data is None:
            return {"available": False, "message": "Keine Meeresdaten für diesen Standort"}

    await cache_set(key, data, settings.ttl_hourly)
    return {**data, "available": True}


@router.get("/warnings")
async def get_warnings(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> dict[str, Any]:
    key = f"warnings:{lat:.4f}:{lon:.4f}"
    cached = await cache_get(key)
    if cached:
        return cached

    async with _get_client() as client:
        data = await dwd.fetch_warnings(lat, lon, client)

    await cache_set(key, data, settings.ttl_warnings)
    return data


@router.get("/radar/latest")
async def get_radar_latest() -> dict[str, Any]:
    key = "radar:latest"
    cached = await cache_get(key)
    if cached:
        return cached

    async with _get_client() as client:
        data = await dwd.fetch_radar_latest(client)
        if data is None:
            raise HTTPException(502, "Radardaten momentan nicht verfügbar")

    await cache_set(key, data, settings.ttl_radar)
    return data


@router.get("/radar/animation")
async def get_radar_animation() -> dict[str, Any]:
    key = "radar:animation"
    cached = await cache_get(key)
    if cached:
        return cached

    async with _get_client() as client:
        data = await dwd.fetch_radar_animation(client)

    await cache_set(key, data, settings.ttl_radar)
    return data


@router.get("/astronomy")
async def get_astronomy(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    date: str = Query(None),
) -> dict[str, Any]:
    from datetime import date as DateType
    target_date = None
    if date:
        try:
            target_date = DateType.fromisoformat(date)
        except ValueError:
            raise HTTPException(400, "Ungültiges Datumsformat (erwartet: YYYY-MM-DD)")

    if target_date is None:
        target_date = DateType.today()

    key = f"astronomy:{lat:.4f}:{lon:.4f}:{target_date.isoformat()}"
    cached = await cache_get(key)
    if cached:
        return cached

    data = compute_astronomy(lat, lon, target_date)

    # Höhendaten ergänzen
    async with _get_client() as client:
        elevation = await fetch_elevation(lat, lon, client)
    data["elevation"] = elevation

    await cache_set(key, data, settings.ttl_astronomy)
    return data


@router.get("/geocode")
async def get_geocode(
    q: str = Query(..., min_length=2),
    lat: float = Query(None, ge=-90, le=90),
    lon: float = Query(None, ge=-180, le=180),
) -> dict[str, Any]:
    # Rückwärts-Geocoding wenn Koordinaten angegeben
    if lat is not None and lon is not None and not q:
        key = f"reverse_geocode:{lat:.4f}:{lon:.4f}"
        cached = await cache_get(key)
        if cached:
            return cached

        async with _get_client() as client:
            data = await reverse_geocode(lat, lon, client)

        await cache_set(key, data, settings.ttl_geocoding)
        return data

    key = f"geocode:{q.lower()}"
    cached = await cache_get(key)
    if cached:
        return {"results": cached}

    async with _get_client() as client:
        try:
            results = await geocode(q, client)
        except httpx.HTTPError as e:
            logger.error(f"Geocoding-Fehler: {e}")
            raise HTTPException(502, "Ortssuche momentan nicht verfügbar")

    await cache_set(key, results, settings.ttl_geocoding)
    return {"results": results}


@router.get("/pollen")
async def get_pollen(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> dict[str, Any]:
    """Pollenflug-Daten (Open-Meteo, falls verfügbar)."""
    key = f"pollen:{lat:.4f}:{lon:.4f}"
    cached = await cache_get(key)
    if cached:
        return cached

    try:
        async with _get_client() as client:
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
                "timezone": "auto",
                "forecast_days": 5,
            }
            resp = await client.get(f"{settings.open_meteo_air_quality}/air-quality", params=params)
            resp.raise_for_status()
            data = resp.json()
            await cache_set(key, data, settings.ttl_air_quality)
            return data
    except Exception as e:
        logger.info(f"Pollen-Daten nicht verfügbar: {e}")
        return {"available": False, "message": "Keine Pollendaten für diesen Standort"}


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "HimmelBlick Backend"}
