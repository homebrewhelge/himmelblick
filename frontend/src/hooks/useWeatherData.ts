import { useQuery } from 'react-query'
import { api } from '@/services/api'
import type { Location } from '@/types/weather'

export function useCurrentWeather(location: Location | null) {
  return useQuery(
    ['current', location?.lat, location?.lon],
    () => api.current(location!.lat, location!.lon),
    { enabled: !!location, staleTime: 5 * 60 * 1000 }
  )
}

export function useHourlyForecast(location: Location | null, hours = 48) {
  return useQuery(
    ['hourly', location?.lat, location?.lon, hours],
    () => api.hourly(location!.lat, location!.lon, hours),
    { enabled: !!location, staleTime: 15 * 60 * 1000 }
  )
}

export function useForecast(location: Location | null, days = 14) {
  return useQuery(
    ['forecast', location?.lat, location?.lon, days],
    () => api.forecast(location!.lat, location!.lon, days),
    { enabled: !!location, staleTime: 30 * 60 * 1000 }
  )
}

export function useEnsemble(location: Location | null) {
  return useQuery(
    ['ensemble', location?.lat, location?.lon],
    () => api.ensemble(location!.lat, location!.lon),
    { enabled: !!location, staleTime: 60 * 60 * 1000 }
  )
}

export function useHistorical(location: Location | null, days = 30) {
  return useQuery(
    ['historical', location?.lat, location?.lon, days],
    () => api.historical(location!.lat, location!.lon, days),
    { enabled: !!location, staleTime: 12 * 60 * 60 * 1000 }
  )
}

export function useWarnings(location: Location | null) {
  return useQuery(
    ['warnings', location?.lat, location?.lon],
    () => api.warnings(location!.lat, location!.lon),
    { enabled: !!location, staleTime: 3 * 60 * 1000, refetchInterval: 5 * 60 * 1000 }
  )
}

export function useAirQuality(location: Location | null) {
  return useQuery(
    ['air-quality', location?.lat, location?.lon],
    () => api.airQuality(location!.lat, location!.lon),
    { enabled: !!location, staleTime: 15 * 60 * 1000 }
  )
}

export function useAstronomy(location: Location | null, date?: string) {
  return useQuery(
    ['astronomy', location?.lat, location?.lon, date],
    () => api.astronomy(location!.lat, location!.lon, date),
    { enabled: !!location, staleTime: 60 * 60 * 1000 }
  )
}
