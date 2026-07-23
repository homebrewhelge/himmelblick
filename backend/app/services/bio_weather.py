import math
from typing import Any


def compute_heat_index(temp_c: float, humidity: float) -> float | None:
    """Hitzeindex nach Rothfusz-Gleichung (Ergebnis in °C)."""
    if temp_c < 27 or humidity < 40:
        return None
    t = temp_c * 9 / 5 + 32  # in Fahrenheit
    rh = humidity

    hi = (-42.379
          + 2.04901523 * t
          + 10.14333127 * rh
          - 0.22475541 * t * rh
          - 0.00683783 * t * t
          - 0.05481717 * rh * rh
          + 0.00122874 * t * t * rh
          + 0.00085282 * t * rh * rh
          - 0.00000199 * t * t * rh * rh)

    # Korrekturen nach Steadman
    if rh < 13 and 80 <= t <= 112:
        hi -= ((13 - rh) / 4) * math.sqrt((17 - abs(t - 95)) / 17)
    elif rh > 85 and 80 <= t <= 87:
        hi += ((rh - 85) / 10) * ((87 - t) / 5)

    return round((hi - 32) * 5 / 9, 1)  # zurück in Celsius


def compute_windchill(temp_c: float, windspeed_kmh: float) -> float | None:
    """Windchill-Temperatur (JAG/TI-Methode, gültig für T ≤ 10°C, Wind ≥ 4.8 km/h)."""
    if temp_c > 10 or windspeed_kmh < 4.8:
        return None
    v = windspeed_kmh ** 0.16
    wc = 13.12 + 0.6215 * temp_c - 11.37 * v + 0.3965 * temp_c * v
    return round(wc, 1)


def compute_humidex(temp_c: float, dewpoint_c: float) -> float | None:
    """Humidex (kanadisches Komfortmaß, gültig für T ≥ 20°C)."""
    if temp_c < 20:
        return None
    e = 6.1078 * math.exp(17.27 * dewpoint_c / (dewpoint_c + 237.3))
    humidex = temp_c + 0.5555 * (e - 10)
    return round(humidex, 1)


def compute_pet(temp_c: float, humidity: float, windspeed_ms: float,
                radiation_wm2: float = 0) -> float | None:
    """
    Vereinfachte PET-Schätzung (Physiological Equivalent Temperature).
    Nutzt UTCI-Näherung da vollständiges PET-Modell Strahlung erfordert.
    """
    try:
        # UTCI-Offset-Näherung nach Bröde (vereinfacht)
        va = max(windspeed_ms, 0.5)
        pa = humidity / 100 * 6.105 * math.exp(17.27 * temp_c / (temp_c + 237.3))

        utci = (temp_c
                + 0.607562052
                - 0.0227712343 * temp_c
                + 8.06470249e-4 * temp_c ** 2
                - 1.54271372e-4 * temp_c ** 3
                - 3.24651995e-6 * temp_c ** 4
                + 7.32602852e-8 * temp_c ** 5
                + 1.35959073e-9 * temp_c ** 6
                - 2.25836520 * va
                + 0.0880326035 * temp_c * va
                + 0.00216844454 * temp_c ** 2 * va
                - 1.53347087e-5 * temp_c ** 3 * va
                + 0.0585345206 * pa
                - 0.00122776561 * temp_c * pa
                - 0.00767272734 * pa ** 2)

        return round(utci, 1)
    except Exception:
        return None


def compute_comfort_recommendations(
    temp_c: float,
    humidity: float,
    windspeed_kmh: float,
    precipitation: float,
    uv_index: float,
    cloudcover: float,
) -> list[dict[str, str]]:
    """Kontextuelle Alltagsempfehlungen als Chips berechnen."""
    chips = []

    # Grillen
    if temp_c >= 18 and precipitation < 0.1 and windspeed_kmh < 40 and cloudcover < 70:
        chips.append({"id": "grillen", "label": "Grillen möglich", "icon": "🔥", "ok": True})
    else:
        reason = "zu kalt" if temp_c < 18 else "Regen" if precipitation >= 0.1 else "zu windig"
        chips.append({"id": "grillen", "label": f"Nicht ideal zum Grillen ({reason})", "icon": "🔥", "ok": False})

    # Wäsche trocknen
    if temp_c >= 12 and precipitation < 0.1 and humidity < 75 and windspeed_kmh > 5:
        chips.append({"id": "waschtag", "label": "Waschtag geeignet", "icon": "👕", "ok": True})
    else:
        chips.append({"id": "waschtag", "label": "Schlechter Waschtag", "icon": "👕", "ok": False})

    # Lüften
    if temp_c >= 10 and precipitation < 0.5 and humidity < 85:
        chips.append({"id": "lueften", "label": "Lüften empfohlen", "icon": "🪟", "ok": True})
    else:
        chips.append({"id": "lueften", "label": "Fenster besser zu", "icon": "🪟", "ok": False})

    # Sonnenschutz
    if uv_index >= 3:
        level = "hoch" if uv_index >= 6 else "moderat"
        chips.append({"id": "sonnenschutz", "label": f"UV-Schutz nötig ({level})", "icon": "🧴", "ok": False})
    else:
        chips.append({"id": "sonnenschutz", "label": "Kein UV-Schutz nötig", "icon": "🧴", "ok": True})

    # Fahrrad
    if temp_c >= 8 and precipitation < 0.2 and windspeed_kmh < 50:
        chips.append({"id": "fahrrad", "label": "Gut für Fahrrad", "icon": "🚲", "ok": True})
    else:
        chips.append({"id": "fahrrad", "label": "Fahrrad besser stehen lassen", "icon": "🚲", "ok": False})

    return chips
