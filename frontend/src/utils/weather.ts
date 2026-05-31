import type { Settings } from '@/types/weather'

// WMO Wettercode → Bezeichnung + Icon-Klasse
export const WMO_CODES: Record<number, { label: string; icon: string; isDay?: boolean }> = {
  0:  { label: 'Klar', icon: 'clear' },
  1:  { label: 'Überwiegend klar', icon: 'mostly-clear' },
  2:  { label: 'Teilweise bewölkt', icon: 'partly-cloudy' },
  3:  { label: 'Bedeckt', icon: 'overcast' },
  45: { label: 'Nebel', icon: 'fog' },
  48: { label: 'Eisnebel', icon: 'fog' },
  51: { label: 'Leichter Nieselregen', icon: 'drizzle' },
  53: { label: 'Nieselregen', icon: 'drizzle' },
  55: { label: 'Starker Nieselregen', icon: 'drizzle' },
  61: { label: 'Leichter Regen', icon: 'rain' },
  63: { label: 'Regen', icon: 'rain' },
  65: { label: 'Starker Regen', icon: 'rain-heavy' },
  71: { label: 'Leichter Schneefall', icon: 'snow' },
  73: { label: 'Schneefall', icon: 'snow' },
  75: { label: 'Starker Schneefall', icon: 'snow-heavy' },
  77: { label: 'Schneekörner', icon: 'snow' },
  80: { label: 'Leichte Schauer', icon: 'showers' },
  81: { label: 'Schauer', icon: 'showers' },
  82: { label: 'Starke Schauer', icon: 'showers-heavy' },
  85: { label: 'Schneeschauer', icon: 'snow-showers' },
  86: { label: 'Starke Schneeschauer', icon: 'snow-showers' },
  95: { label: 'Gewitter', icon: 'thunderstorm' },
  96: { label: 'Gewitter mit Hagel', icon: 'thunderstorm-hail' },
  99: { label: 'Heftiges Gewitter', icon: 'thunderstorm-hail' },
}

export function wmoLabel(code: number): string {
  return WMO_CODES[code]?.label ?? 'Unbekannt'
}

export function wmoIcon(code: number, isDay = true): string {
  const icon = WMO_CODES[code]?.icon ?? 'unknown'
  if ((code === 0 || code === 1) && !isDay) return 'clear-night'
  if (code === 2 && !isDay) return 'partly-cloudy-night'
  return icon
}

export function convertTemp(celsius: number, unit: Settings['tempUnit']): number {
  if (unit === 'fahrenheit') return Math.round(celsius * 9 / 5 + 32)
  return Math.round(celsius * 10) / 10
}

export function tempLabel(unit: Settings['tempUnit']): string {
  return unit === 'fahrenheit' ? '°F' : '°C'
}

export function convertWind(kmh: number, unit: Settings['windUnit']): number | string {
  switch (unit) {
    case 'ms': return Math.round(kmh / 3.6 * 10) / 10
    case 'beaufort': return kmhToBeaufort(kmh)
    case 'knots': return Math.round(kmh * 0.539957 * 10) / 10
    default: return Math.round(kmh)
  }
}

export function windLabel(unit: Settings['windUnit']): string {
  switch (unit) {
    case 'ms': return 'm/s'
    case 'beaufort': return 'Bft'
    case 'knots': return 'kn'
    default: return 'km/h'
  }
}

function kmhToBeaufort(kmh: number): number {
  const thresholds = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 117]
  return thresholds.findIndex(t => kmh < t)
}

export function convertPressure(hpa: number, unit: Settings['pressureUnit']): number {
  switch (unit) {
    case 'inhg': return Math.round(hpa * 0.02953 * 100) / 100
    default: return Math.round(hpa)
  }
}

export function pressureLabel(unit: Settings['pressureUnit']): string {
  switch (unit) {
    case 'inhg': return 'inHg'
    default: return 'hPa'
  }
}

export function windDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
}

export function uvIndexLabel(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: 'Niedrig', color: '#22c55e' }
  if (uv < 6) return { label: 'Moderat', color: '#eab308' }
  if (uv < 8) return { label: 'Hoch', color: '#f97316' }
  if (uv < 11) return { label: 'Sehr hoch', color: '#ef4444' }
  return { label: 'Extrem', color: '#a855f7' }
}

export function aqiLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: 'Gut', color: '#22c55e' }
  if (aqi <= 40) return { label: 'Befriedigend', color: '#84cc16' }
  if (aqi <= 60) return { label: 'Mäßig', color: '#eab308' }
  if (aqi <= 80) return { label: 'Schlecht', color: '#f97316' }
  if (aqi <= 100) return { label: 'Sehr schlecht', color: '#ef4444' }
  return { label: 'Extrem schlecht', color: '#7c3aed' }
}

export function formatTime(isoString: string, format: Settings['timeFormat'] = '24h'): string {
  const d = new Date(isoString)
  if (format === '12h') {
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function getWeatherBackground(code: number, isDay: boolean): string {
  if (!isDay) return 'night'
  if (code === 0) return 'sunny'
  if (code <= 2) return 'partly-cloudy'
  if (code === 3) return 'overcast'
  if (code >= 51 && code <= 67) return 'rainy'
  if (code >= 71 && code <= 77) return 'snowy'
  if (code >= 80 && code <= 82) return 'showery'
  if (code >= 95) return 'stormy'
  if (code === 45 || code === 48) return 'foggy'
  return 'cloudy'
}
