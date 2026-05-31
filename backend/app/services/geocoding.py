import logging
from typing import Any

import httpx

from ..config import settings

logger = logging.getLogger(__name__)


async def geocode(query: str, client: httpx.AsyncClient) -> list[dict[str, Any]]:
    """Ortssuche über OpenStreetMap Nominatim."""
    params = {
        "q": query,
        "format": "jsonv2",
        "addressdetails": 1,
        "limit": 8,
        "accept-language": "de,en",
    }
    headers = {"User-Agent": "HimmelBlick/1.0 (weather app)"}
    resp = await client.get(
        f"{settings.nominatim_base}/search",
        params=params,
        headers=headers,
    )
    resp.raise_for_status()
    results = resp.json()

    return [
        {
            "place_id": r.get("place_id"),
            "name": r.get("display_name", ""),
            "short_name": _build_short_name(r),
            "lat": float(r.get("lat", 0)),
            "lon": float(r.get("lon", 0)),
            "type": r.get("type", ""),
            "importance": r.get("importance", 0),
            "address": r.get("address", {}),
        }
        for r in results
    ]


async def reverse_geocode(lat: float, lon: float, client: httpx.AsyncClient) -> dict[str, Any]:
    """Koordinaten in Ortsname umwandeln."""
    params = {
        "lat": lat,
        "lon": lon,
        "format": "jsonv2",
        "addressdetails": 1,
        "accept-language": "de,en",
    }
    headers = {"User-Agent": "HimmelBlick/1.0 (weather app)"}
    resp = await client.get(
        f"{settings.nominatim_base}/reverse",
        params=params,
        headers=headers,
    )
    resp.raise_for_status()
    r = resp.json()

    return {
        "name": _build_short_name(r),
        "display_name": r.get("display_name", ""),
        "lat": lat,
        "lon": lon,
        "address": r.get("address", {}),
    }


async def fetch_elevation(lat: float, lon: float, client: httpx.AsyncClient) -> dict[str, Any]:
    """Höhe über NN für Koordinaten über OpenTopoData abrufen."""
    try:
        resp = await client.get(
            f"{settings.opentopodata_base}/srtm90m",
            params={"locations": f"{lat},{lon}"},
        )
        resp.raise_for_status()
        data = resp.json()
        elevation = data.get("results", [{}])[0].get("elevation")
        return {"elevation": elevation, "unit": "m"}
    except Exception as e:
        logger.info(f"Höhendaten nicht verfügbar: {e}")
        return {"elevation": None, "unit": "m"}


def _build_short_name(result: dict) -> str:
    """Kurzen Anzeigenamen aus Nominatim-Adressdaten zusammenbauen."""
    addr = result.get("address", {})
    parts = []

    city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("municipality")
    if city:
        parts.append(city)

    state = addr.get("state")
    country_code = addr.get("country_code", "").upper()

    if state and country_code == "DE":
        pass  # Bundesland weglassen für Deutschland
    elif state:
        parts.append(state)

    if country_code and country_code != "DE":
        parts.append(country_code)

    return ", ".join(parts) if parts else result.get("display_name", "")[:60]
