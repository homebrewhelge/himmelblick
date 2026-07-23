import httpx

from .config import settings

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    """Gemeinsamen, wiederverwendeten HTTP-Client zurückgeben (Connection-Pooling)."""
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=settings.http_timeout)
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
