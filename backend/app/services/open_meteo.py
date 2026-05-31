import logging
from typing import Any, Optional

import httpx

from ..config import settings

logger = logging.getLogger(__name__)

# Alle Open-Meteo Wettermodelle für Ensemble
ENSEMBLE_MODELS = ["icon_seamless", "ecmwf_ifs025", "gfs_seamless", "ukmo_seamless", "meteofrance_seamless", "arpae_cosmo_seamless", "knmi_seamless"]

# Stündliche Variablen
HOURLY_VARS = [
    "temperature_2m", "apparent_temperature", "precipitation", "snowfall",
    "snow_depth", "windspeed_10m", "windgusts_10m", "winddirection_10m",
    "cloudcover", "cloudcover_low", "cloudcover_mid", "cloudcover_high",
    "visibility", "et0_fao_evapotranspiration", "soil_moisture_0_to_1cm",
    "uv_index", "sunshine_duration", "weathercode", "cape", "lifted_index",
    "precipitation_probability", "relativehumidity_2m", "dewpoint_2m",
    "surface_pressure", "is_day",
]

# Tägliche Variablen
DAILY_VARS = [
    "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max",
    "apparent_temperature_min", "sunrise", "sunset",
    "precipitation_sum", "rain_sum", "showers_sum",
    "snowfall_sum", "precipitation_hours", "precipitation_probability_max",
    "windspeed_10m_max", "windgusts_10m_max", "winddirection_10m_dominant",
    "shortwave_radiation_sum", "et0_fao_evapotranspiration", "uv_index_max",
    "sunshine_duration", "weathercode",
]


async def fetch_current(lat: float, lon: float, client: httpx.AsyncClient) -> dict[str, Any]:
    """Aktuelle Wetterdaten von Open-Meteo abrufen."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m", "apparent_temperature", "is_day",
            "precipitation", "rain", "showers", "snowfall",
            "weathercode", "cloudcover", "pressure_msl", "surface_pressure",
            "windspeed_10m", "windgusts_10m", "winddirection_10m",
            "relativehumidity_2m", "dewpoint_2m", "visibility",
            "uv_index", "cape",
        ]),
        "timezone": "auto",
        "wind_speed_unit": "kmh",
    }
    resp = await client.get(f"{settings.open_meteo_base}/forecast", params=params)
    resp.raise_for_status()
    return resp.json()


async def fetch_hourly(lat: float, lon: float, hours: int, client: httpx.AsyncClient) -> dict[str, Any]:
    """Stündliche Vorhersage bis 48h von Open-Meteo abrufen."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(HOURLY_VARS),
        "timezone": "auto",
        "wind_speed_unit": "kmh",
        "forecast_hours": min(hours, 168),
    }
    resp = await client.get(f"{settings.open_meteo_base}/forecast", params=params)
    resp.raise_for_status()
    return resp.json()


async def fetch_forecast(lat: float, lon: float, days: int, client: httpx.AsyncClient) -> dict[str, Any]:
    """Tägliche Vorhersage bis 16 Tage von Open-Meteo abrufen."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join(DAILY_VARS),
        "hourly": ",".join(HOURLY_VARS),
        "timezone": "auto",
        "wind_speed_unit": "kmh",
        "forecast_days": min(days, 16),
    }
    resp = await client.get(f"{settings.open_meteo_base}/forecast", params=params)
    resp.raise_for_status()
    return resp.json()


async def fetch_ensemble(lat: float, lon: float, client: httpx.AsyncClient) -> dict[str, Any]:
    """Alle 7 Wettermodelle parallel abrufen und als Ensemble zurückgeben."""
    results: dict[str, Any] = {}
    errors: list[str] = []

    ensemble_vars = [
        "temperature_2m", "precipitation", "windspeed_10m",
        "weathercode", "cloudcover",
    ]

    for model in ENSEMBLE_MODELS:
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": ",".join(ensemble_vars),
                "models": model,
                "timezone": "auto",
                "wind_speed_unit": "kmh",
                "forecast_days": 7,
            }
            resp = await client.get(f"{settings.open_meteo_base}/forecast", params=params)
            resp.raise_for_status()
            results[model] = resp.json()
        except Exception as e:
            logger.warning(f"Ensemble-Modell {model} nicht verfügbar: {e}")
            errors.append(model)

    return {"models": results, "failed_models": errors}


async def fetch_historical(lat: float, lon: float, days: int, client: httpx.AsyncClient) -> dict[str, Any]:
    """Historische Wetterdaten der letzten N Tage von Open-Meteo abrufen."""
    from datetime import date, timedelta
    end_date = date.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=days - 1)

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join(DAILY_VARS),
        "hourly": "temperature_2m,precipitation,cloudcover,windspeed_10m,weathercode",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "timezone": "auto",
        "wind_speed_unit": "kmh",
    }
    resp = await client.get(f"{settings.open_meteo_archive}/archive", params=params)
    resp.raise_for_status()
    return resp.json()


async def fetch_air_quality(lat: float, lon: float, client: httpx.AsyncClient) -> dict[str, Any]:
    """Luftqualitätsdaten von Open-Meteo Air Quality API abrufen."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi",
        "timezone": "auto",
        "forecast_days": 3,
    }
    resp = await client.get(f"{settings.open_meteo_air_quality}/air-quality", params=params)
    resp.raise_for_status()
    return resp.json()


async def fetch_marine(lat: float, lon: float, client: httpx.AsyncClient) -> Optional[dict[str, Any]]:
    """Marine-Vorhersage für Küstenstandorte abrufen (kann fehlschlagen für Binnenstandorte)."""
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height",
            "timezone": "auto",
            "forecast_days": 7,
        }
        resp = await client.get(f"{settings.open_meteo_marine}/marine", params=params)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.info(f"Marine-Daten nicht verfügbar für ({lat}, {lon}): {e}")
        return None
