import { useQuery } from 'react-query'
import { api } from '@/services/api'
import type {
  Location, AirQualityData, AstronomyData, EnsembleData,
  CurrentWeatherResponse, HourlyResponse, ForecastResponse, HistoricalResponse, WarningsResponse,
} from '@/types/weather'

export function useCurrentWeather(location: Location | null) {
  return useQuery<CurrentWeatherResponse>(
    ['current', location?.lat, location?.lon],
    () => api.current(location!.lat, location!.lon) as Promise<CurrentWeatherResponse>,
    { enabled: !!location, staleTime: 5 * 60 * 1000 }
  )
}

export function useHourlyForecast(location: Location | null, hours = 48) {
  return useQuery<HourlyResponse>(
    ['hourly', location?.lat, location?.lon, hours],
    () => api.hourly(location!.lat, location!.lon, hours) as Promise<HourlyResponse>,
    { enabled: !!location, staleTime: 15 * 60 * 1000 }
  )
}

export function useForecast(location: Location | null, days = 14) {
  return useQuery<ForecastResponse>(
    ['forecast', location?.lat, location?.lon, days],
    () => api.forecast(location!.lat, location!.lon, days) as Promise<ForecastResponse>,
    { enabled: !!location, staleTime: 30 * 60 * 1000 }
  )
}

export function useEnsemble(location: Location | null) {
  return useQuery<EnsembleData>(
    ['ensemble', location?.lat, location?.lon],
    () => api.ensemble(location!.lat, location!.lon) as Promise<EnsembleData>,
    { enabled: !!location, staleTime: 60 * 60 * 1000 }
  )
}

export function useHistorical(location: Location | null, days = 30) {
  return useQuery<HistoricalResponse>(
    ['historical', location?.lat, location?.lon, days],
    () => api.historical(location!.lat, location!.lon, days) as Promise<HistoricalResponse>,
    { enabled: !!location, staleTime: 12 * 60 * 60 * 1000 }
  )
}

export function useWarnings(location: Location | null) {
  return useQuery<WarningsResponse>(
    ['warnings', location?.lat, location?.lon],
    () => api.warnings(location!.lat, location!.lon) as Promise<WarningsResponse>,
    { enabled: !!location, staleTime: 3 * 60 * 1000, refetchInterval: 5 * 60 * 1000 }
  )
}

export function useAirQuality(location: Location | null) {
  return useQuery<AirQualityData>(
    ['air-quality', location?.lat, location?.lon],
    () => api.airQuality(location!.lat, location!.lon) as Promise<AirQualityData>,
    { enabled: !!location, staleTime: 15 * 60 * 1000 }
  )
}

export function useAstronomy(location: Location | null, date?: string) {
  return useQuery<AstronomyData>(
    ['astronomy', location?.lat, location?.lon, date],
    () => api.astronomy(location!.lat, location!.lon, date) as Promise<AstronomyData>,
    { enabled: !!location, staleTime: 60 * 60 * 1000 }
  )
}
