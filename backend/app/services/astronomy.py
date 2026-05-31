import logging
import math
from datetime import date, datetime, timezone
from typing import Any

import ephem
import pytz

logger = logging.getLogger(__name__)


def compute_astronomy(lat: float, lon: float, target_date: date) -> dict[str, Any]:
    """Astronomische Daten (Sonne, Mond, Dämmerung) für Datum und Standort berechnen."""
    obs = ephem.Observer()
    obs.lat = str(lat)
    obs.lon = str(lon)
    obs.date = target_date.strftime("%Y/%m/%d 12:00:00")
    obs.pressure = 0  # Atmosphärische Refraktion ignorieren für bürgerliche Dämmerung

    sun = ephem.Sun()
    moon = ephem.Moon()

    result: dict[str, Any] = {}

    # Sonnenauf- und -untergang
    try:
        obs.horizon = "0"
        result["sunrise"] = ephem.localtime(obs.next_rising(sun, start=obs.date)).isoformat()
        result["sunset"] = ephem.localtime(obs.next_setting(sun, start=obs.date)).isoformat()
    except Exception:
        result["sunrise"] = None
        result["sunset"] = None

    # Bürgerliche Dämmerung (−6°)
    try:
        obs.horizon = "-6"
        result["civil_dawn"] = ephem.localtime(obs.next_rising(sun, start=obs.date)).isoformat()
        result["civil_dusk"] = ephem.localtime(obs.next_setting(sun, start=obs.date)).isoformat()
    except Exception:
        result["civil_dawn"] = None
        result["civil_dusk"] = None

    # Nautische Dämmerung (−12°)
    try:
        obs.horizon = "-12"
        result["nautical_dawn"] = ephem.localtime(obs.next_rising(sun, start=obs.date)).isoformat()
        result["nautical_dusk"] = ephem.localtime(obs.next_setting(sun, start=obs.date)).isoformat()
    except Exception:
        result["nautical_dawn"] = None
        result["nautical_dusk"] = None

    # Astronomische Dämmerung (−18°)
    try:
        obs.horizon = "-18"
        result["astronomical_dawn"] = ephem.localtime(obs.next_rising(sun, start=obs.date)).isoformat()
        result["astronomical_dusk"] = ephem.localtime(obs.next_setting(sun, start=obs.date)).isoformat()
    except Exception:
        result["astronomical_dawn"] = None
        result["astronomical_dusk"] = None

    # Tageslänge berechnen
    if result.get("sunrise") and result.get("sunset"):
        try:
            sr = datetime.fromisoformat(result["sunrise"])
            ss = datetime.fromisoformat(result["sunset"])
            day_length_sec = (ss - sr).total_seconds()
            result["day_length_seconds"] = int(day_length_sec)
            result["day_length_formatted"] = f"{int(day_length_sec // 3600)}h {int((day_length_sec % 3600) // 60)}min"
        except Exception:
            result["day_length_seconds"] = None

    # Mondauf- und -untergang
    obs.horizon = "0"
    try:
        result["moonrise"] = ephem.localtime(obs.next_rising(moon, start=obs.date)).isoformat()
        result["moonset"] = ephem.localtime(obs.next_setting(moon, start=obs.date)).isoformat()
    except Exception:
        result["moonrise"] = None
        result["moonset"] = None

    # Mondphase (0 = Neumond, 0.5 = Vollmond, 1 = wieder Neumond)
    moon.compute(obs.date)
    result["moon_phase"] = round(moon.phase / 100, 3)  # 0–1
    result["moon_illumination"] = round(moon.phase, 1)  # 0–100%
    result["moon_phase_name"] = _moon_phase_name(moon.phase / 100)

    # Goldene Stunde (ca. 6° unter bis 6° über Horizont)
    result["golden_hour_morning"] = result.get("civil_dawn")
    result["golden_hour_evening"] = result.get("civil_dusk")

    # Nächste Sonnen- und Mondfinsternis (vereinfacht)
    result["next_solar_eclipse"] = _next_solar_eclipse(target_date)
    result["next_lunar_eclipse"] = _next_lunar_eclipse(target_date)

    return result


def _moon_phase_name(phase: float) -> str:
    """Mondphasenname aus numerischem Wert (0–1) bestimmen."""
    if phase < 0.03 or phase > 0.97:
        return "Neumond"
    elif phase < 0.22:
        return "Zunehmende Sichel"
    elif phase < 0.28:
        return "Erstes Viertel"
    elif phase < 0.47:
        return "Zunehmender Mond"
    elif phase < 0.53:
        return "Vollmond"
    elif phase < 0.72:
        return "Abnehmender Mond"
    elif phase < 0.78:
        return "Letztes Viertel"
    else:
        return "Abnehmende Sichel"


def _next_solar_eclipse(from_date: date) -> str | None:
    """Nächste Sonnenfinsternis-Datum (vereinfacht, bekannte Daten)."""
    known = [
        date(2026, 8, 12),
        date(2027, 8, 2),
        date(2028, 7, 22),
        date(2029, 1, 5),
    ]
    for d in known:
        if d >= from_date:
            return d.isoformat()
    return None


def _next_lunar_eclipse(from_date: date) -> str | None:
    """Nächste Mondfinsternis-Datum (vereinfacht, bekannte Daten)."""
    known = [
        date(2025, 3, 14),
        date(2025, 9, 7),
        date(2026, 3, 3),
        date(2026, 8, 28),
    ]
    for d in known:
        if d >= from_date:
            return d.isoformat()
    return None
