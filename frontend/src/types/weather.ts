export interface Location {
  lat: number
  lon: number
  name: string
  short_name?: string
  displayName?: string
  elevation?: number | null
  place_id?: number
  importance?: number
  type?: string
  address?: Record<string, string>
}

export interface CurrentWeather {
  temperature_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  weathercode: number
  cloudcover: number
  pressure_msl: number
  windspeed_10m: number
  windgusts_10m: number
  winddirection_10m: number
  relativehumidity_2m: number
  dewpoint_2m: number
  visibility: number
  uv_index: number
  cape: number
  time: string
}

export interface BioData {
  heat_index: number | null
  windchill: number | null
  humidex: number | null
  pet: number | null
  recommendations: Recommendation[]
}

export interface Recommendation {
  id: string
  label: string
  icon: string
  ok: boolean
}

export interface HourlyForecast {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  precipitation: number[]
  precipitation_probability: number[]
  weathercode: number[]
  windspeed_10m: number[]
  windgusts_10m: number[]
  winddirection_10m: number[]
  cloudcover: number[]
  cloudcover_low: number[]
  cloudcover_mid: number[]
  cloudcover_high: number[]
  relativehumidity_2m: number[]
  uv_index: number[]
  is_day: number[]
  sunshine_duration: number[]
}

export interface DailyForecast {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
  windspeed_10m_max: number[]
  winddirection_10m_dominant: number[]
  weathercode: number[]
  sunrise: string[]
  sunset: string[]
  moonrise: string[]
  moonset: string[]
  moon_phase: number[]
  sunshine_duration: number[]
  uv_index_max: number[]
}

export interface EnsembleModel {
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation: number[]
    windspeed_10m: number[]
    weathercode: number[]
    cloudcover: number[]
  }
  latitude: number
  longitude: number
  timezone: string
}

export interface EnsembleData {
  models: Record<string, EnsembleModel>
  failed_models: string[]
}

export interface Warning {
  region: string
  level: number
  type: number
  event: string
  headline: string
  description: string
  instruction: string
  start: number | null
  end: number | null
  stateShort: string
}

export interface AirQualityData {
  hourly: {
    time: string[]
    pm2_5: number[]
    pm10: number[]
    ozone: number[]
    nitrogen_dioxide: number[]
    sulphur_dioxide: number[]
    carbon_monoxide: number[]
    european_aqi: number[]
  }
}

export interface AstronomyData {
  sunrise: string | null
  sunset: string | null
  civil_dawn: string | null
  civil_dusk: string | null
  nautical_dawn: string | null
  nautical_dusk: string | null
  astronomical_dawn: string | null
  astronomical_dusk: string | null
  day_length_seconds: number | null
  day_length_formatted: string | null
  moonrise: string | null
  moonset: string | null
  moon_phase: number
  moon_illumination: number
  moon_phase_name: string
  golden_hour_morning: string | null
  golden_hour_evening: string | null
  next_solar_eclipse: string | null
  next_lunar_eclipse: string | null
  elevation?: { elevation: number | null; unit: string }
}

export interface CurrentWeatherResponse {
  current: CurrentWeather
  bio: BioData
}

export interface HourlyResponse {
  hourly: HourlyForecast
}

export interface ForecastResponse {
  daily: DailyForecast
  hourly: HourlyForecast
}

export interface HistoricalResponse {
  daily: DailyForecast
}

export interface WarningsResponse {
  warnings: Warning[]
  raw_count?: number
  error?: string
}

export type Theme = 'auto' | 'light' | 'dark' | 'storm'
export type TempUnit = 'celsius' | 'fahrenheit'
export type WindUnit = 'kmh' | 'ms' | 'beaufort' | 'knots'
export type PressureUnit = 'hpa' | 'mbar' | 'inhg'
export type PrecipUnit = 'mm' | 'inch'
export type TimeFormat = '24h' | '12h'
export type Language = 'de' | 'en'

export interface Settings {
  theme: Theme
  tempUnit: TempUnit
  windUnit: WindUnit
  pressureUnit: PressureUnit
  precipUnit: PrecipUnit
  timeFormat: TimeFormat
  language: Language
  animations: boolean
}
