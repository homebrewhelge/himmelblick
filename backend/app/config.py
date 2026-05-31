from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379"
    cors_origins: str = "http://localhost"
    log_level: str = "info"

    # Externe API-Basis-URLs
    open_meteo_base: str = "https://api.open-meteo.com/v1"
    open_meteo_archive: str = "https://archive-api.open-meteo.com/v1"
    open_meteo_air_quality: str = "https://air-quality-api.open-meteo.com/v1"
    open_meteo_marine: str = "https://marine-api.open-meteo.com/v1"
    brightsky_base: str = "https://api.brightsky.dev"
    nominatim_base: str = "https://nominatim.openstreetmap.org"
    opentopodata_base: str = "https://api.opentopodata.org/v1"
    dwd_warnings_url: str = "https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json"
    dwd_radar_base: str = "https://opendata.dwd.de/weather/radar/composit/rx"

    # Cache TTLs in Sekunden
    ttl_current: int = 600       # 10 Minuten
    ttl_hourly: int = 1800       # 30 Minuten
    ttl_forecast: int = 3600     # 1 Stunde
    ttl_ensemble: int = 10800    # 3 Stunden
    ttl_historical: int = 86400  # 24 Stunden
    ttl_warnings: int = 300      # 5 Minuten
    ttl_geocoding: int = 604800  # 7 Tage
    ttl_air_quality: int = 1800  # 30 Minuten
    ttl_astronomy: int = 3600    # 1 Stunde
    ttl_radar: int = 120         # 2 Minuten

    # HTTP-Client Timeout
    http_timeout: float = 10.0

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
