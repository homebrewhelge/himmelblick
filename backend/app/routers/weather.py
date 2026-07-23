import logging
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

from ..cache import cache_get, cache_set
from ..config import settings
from ..http_client import get_client
from ..services import open_meteo
from ..services.bio_weather import (
    compute_comfort_recommendations,
    compute_heat_index,
    compute_humidex,
    compute_pet,
    compute_windchill,
)

router = APIRouter(prefix="/api/weather", tags=["weather"])
logger = logging.getLogger(__name__)


@router.get("/current")
async def get_current(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> dict[str, Any]:
    key = f"current:{lat:.4f}:{lon:.4f}"
    cached = await cache_get(key)
    if cached:
        return cached

    client = get_client()
    try:
        data = await open_meteo.fetch_current(lat, lon, client)
    except httpx.HTTPError as e:
        logger.error(f"Open-Meteo Fehler (current): {e}")
        raise HTTPException(502, "Wetterdaten momentan nicht verfügbar")

    current = data.get("current", {})
    temp = current.get("temperature_2m")
    # Werte können in der API-Antwort als null vorkommen (z. B. Datenlücken) —
    # .get(key, default) greift nur wenn der Schlüssel ganz fehlt, nicht bei null
    humidity = current.get("relativehumidity_2m") or 0
    wind_kmh = current.get("windspeed_10m") or 0
    precip = current.get("precipitation") or 0
    uv = current.get("uv_index") or 0
    cloud = current.get("cloudcover") or 0
    dewpoint = current.get("dewpoint_2m")
    if dewpoint is None:
        dewpoint = temp

    result = {
        **data,
        "bio": {
            "heat_index": compute_heat_index(temp, humidity) if temp is not None else None,
            "windchill": compute_windchill(temp, wind_kmh) if temp is not None else None,
            "humidex": compute_humidex(temp, dewpoint) if temp is not None else None,
            "pet": compute_pet(temp, humidity, wind_kmh / 3.6) if temp is not None else None,
            "recommendations": compute_comfort_recommendations(
                temp or 0, humidity, wind_kmh, precip, uv, cloud
            ),
        },
    }

    await cache_set(key, result, settings.ttl_current)
    return result


@router.get("/hourly")
async def get_hourly(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    hours: int = Query(48, ge=1, le=168),
) -> dict[str, Any]:
    key = f"hourly:{lat:.4f}:{lon:.4f}:{hours}"
    cached = await cache_get(key)
    if cached:
        return cached

    client = get_client()
    try:
        data = await open_meteo.fetch_hourly(lat, lon, hours, client)
    except httpx.HTTPError as e:
        logger.error(f"Open-Meteo Fehler (hourly): {e}")
        raise HTTPException(502, "Stündliche Vorhersage momentan nicht verfügbar")

    await cache_set(key, data, settings.ttl_hourly)
    return data


@router.get("/forecast")
async def get_forecast(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    days: int = Query(14, ge=1, le=16),
) -> dict[str, Any]:
    key = f"forecast:{lat:.4f}:{lon:.4f}:{days}"
    cached = await cache_get(key)
    if cached:
        return cached

    client = get_client()
    try:
        data = await open_meteo.fetch_forecast(lat, lon, days, client)
    except httpx.HTTPError as e:
        logger.error(f"Open-Meteo Fehler (forecast): {e}")
        raise HTTPException(502, "Vorhersage momentan nicht verfügbar")

    await cache_set(key, data, settings.ttl_forecast)
    return data


@router.get("/ensemble")
async def get_ensemble(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> dict[str, Any]:
    key = f"ensemble:{lat:.4f}:{lon:.4f}"
    cached = await cache_get(key)
    if cached:
        return cached

    client = get_client()
    data = await open_meteo.fetch_ensemble(lat, lon, client)

    await cache_set(key, data, settings.ttl_ensemble)
    return data


@router.get("/historical")
async def get_historical(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    days: int = Query(30, ge=1, le=90),
) -> dict[str, Any]:
    key = f"historical:{lat:.4f}:{lon:.4f}:{days}"
    cached = await cache_get(key)
    if cached:
        return cached

    client = get_client()
    try:
        data = await open_meteo.fetch_historical(lat, lon, days, client)
    except httpx.HTTPError as e:
        logger.error(f"Open-Meteo Fehler (historical): {e}")
        raise HTTPException(502, "Historische Daten momentan nicht verfügbar")

    await cache_set(key, data, settings.ttl_historical)
    return data
