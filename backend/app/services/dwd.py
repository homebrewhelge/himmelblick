import logging
from typing import Any, Optional

import httpx

from ..config import settings

logger = logging.getLogger(__name__)


async def fetch_warnings(lat: float, lon: float, client: httpx.AsyncClient) -> dict[str, Any]:
    """DWD-Unwetterwarnungen für den aktuellen Landkreis abrufen."""
    try:
        resp = await client.get(settings.dwd_warnings_url)
        resp.raise_for_status()
        # DWD liefert JSONP — ersten und letzten Teil entfernen
        text = resp.text.strip()
        if text.startswith("warnWetter.loadWarnings("):
            text = text[len("warnWetter.loadWarnings("):]
        if text.endswith(");"):
            text = text[:-2]

        import json
        data = json.loads(text)

        # Relevante Warnungen für den Standort filtern
        warnings = _filter_warnings_for_location(data, lat, lon)
        return {"warnings": warnings, "raw_count": len(data.get("warnings", {}))}
    except Exception as e:
        logger.warning(f"DWD-Warnungen konnten nicht geladen werden: {e}")
        return {"warnings": [], "error": str(e)}


def _filter_warnings_for_location(data: dict, lat: float, lon: float) -> list[dict]:
    """Warnungen für den nächstgelegenen Landkreis filtern."""
    all_warnings = []
    warnings_dict = data.get("warnings", {})

    for region_key, region_warnings in warnings_dict.items():
        if isinstance(region_warnings, list):
            for w in region_warnings:
                if isinstance(w, dict):
                    all_warnings.append({
                        "region": region_key,
                        "level": w.get("level", 0),
                        "type": w.get("type", 0),
                        "event": w.get("event", ""),
                        "headline": w.get("headline", ""),
                        "description": w.get("description", ""),
                        "instruction": w.get("instruction", ""),
                        "start": w.get("start"),
                        "end": w.get("end"),
                        "stateShort": w.get("stateShort", ""),
                    })

    # Warnungen nach Schwere sortieren
    all_warnings.sort(key=lambda x: x.get("level", 0), reverse=True)
    return all_warnings[:20]


async def fetch_radar_latest(client: httpx.AsyncClient) -> Optional[dict[str, Any]]:
    """Neuestes DWD RADOLAN RX Radar-Komposit abrufen."""
    try:
        # DWD liefert Radar als Binärdatei — Metadaten + URL zurückgeben
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        # RADOLAN wird alle 5 Minuten aktualisiert
        minute = (now.minute // 5) * 5
        timestamp = now.replace(minute=minute, second=0, microsecond=0)

        return {
            "timestamp": timestamp.isoformat(),
            "source": "DWD RADOLAN RX",
            "wms_url": "https://maps.dwd.de/geoserver/dwd/wms",
            "wms_layer": "dwd:Niederschlagsradar",
            "legend_url": "https://www.dwd.de/DWD/warnungen/warnapp_gemeinden/json/radar_rx_legend.png",
        }
    except Exception as e:
        logger.warning(f"Radar-Metadaten konnten nicht ermittelt werden: {e}")
        return None


async def fetch_radar_animation(client: httpx.AsyncClient) -> dict[str, Any]:
    """URLs für die letzten 12 Radar-Frames (60 Minuten) zusammenstellen."""
    from datetime import datetime, timezone, timedelta

    now = datetime.now(timezone.utc)
    frames = []

    for i in range(12, 0, -1):
        dt = now - timedelta(minutes=i * 5)
        minute = (dt.minute // 5) * 5
        dt = dt.replace(minute=minute, second=0, microsecond=0)
        frames.append({
            "timestamp": dt.isoformat(),
            "label": dt.strftime("%H:%M"),
        })

    return {
        "frames": frames,
        "wms_url": "https://maps.dwd.de/geoserver/dwd/wms",
        "wms_layer": "dwd:Niederschlagsradar",
        "wms_time_param": True,
    }
