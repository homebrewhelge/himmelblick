import { useCallback } from 'react'
import { useStore } from '@/store'
import type { Location } from '@/types/weather'
import { api } from '@/services/api'

export function useLocation() {
  const { location, setLocation, favorites, addFavorite, removeFavorite } = useStore()

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const result = await api.reverseGeocode(lat, lon) as { name: string }
          setLocation({
            lat,
            lon,
            name: result.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          })
        } catch {
          setLocation({ lat, lon, name: `${lat.toFixed(2)}, ${lon.toFixed(2)}` })
        }
      },
      () => { /* Geolokation abgelehnt — Suchfeld wird geöffnet */ }
    )
  }, [setLocation])

  const setFromUrlParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    const lat = parseFloat(params.get('lat') ?? '')
    const lon = parseFloat(params.get('lon') ?? '')
    const name = params.get('name') ?? ''
    if (!isNaN(lat) && !isNaN(lon)) {
      setLocation({ lat, lon, name: name || `${lat.toFixed(2)}, ${lon.toFixed(2)}` })
      return true
    }
    return false
  }, [setLocation])

  const updateUrlParams = useCallback((loc: Location) => {
    const url = new URL(window.location.href)
    url.searchParams.set('lat', loc.lat.toFixed(4))
    url.searchParams.set('lon', loc.lon.toFixed(4))
    url.searchParams.set('name', loc.name)
    window.history.replaceState({}, '', url.toString())
  }, [])

  return { location, setLocation, requestGeolocation, setFromUrlParams, updateUrlParams, favorites, addFavorite, removeFavorite }
}
