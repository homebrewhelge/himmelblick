const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  current: (lat: number, lon: number) =>
    get(`/weather/current?lat=${lat}&lon=${lon}`),

  hourly: (lat: number, lon: number, hours = 48) =>
    get(`/weather/hourly?lat=${lat}&lon=${lon}&hours=${hours}`),

  forecast: (lat: number, lon: number, days = 14) =>
    get(`/weather/forecast?lat=${lat}&lon=${lon}&days=${days}`),

  ensemble: (lat: number, lon: number) =>
    get(`/weather/ensemble?lat=${lat}&lon=${lon}`),

  historical: (lat: number, lon: number, days = 30) =>
    get(`/weather/historical?lat=${lat}&lon=${lon}&days=${days}`),

  airQuality: (lat: number, lon: number) =>
    get(`/air-quality?lat=${lat}&lon=${lon}`),

  marine: (lat: number, lon: number) =>
    get(`/marine?lat=${lat}&lon=${lon}`),

  warnings: (lat: number, lon: number) =>
    get(`/warnings?lat=${lat}&lon=${lon}`),

  radarLatest: () =>
    get('/radar/latest'),

  radarAnimation: () =>
    get('/radar/animation'),

  astronomy: (lat: number, lon: number, date?: string) =>
    get(`/astronomy?lat=${lat}&lon=${lon}${date ? `&date=${date}` : ''}`),

  geocode: (q: string) =>
    get(`/geocode?q=${encodeURIComponent(q)}`),

  pollen: (lat: number, lon: number) =>
    get(`/pollen?lat=${lat}&lon=${lon}`),
}
