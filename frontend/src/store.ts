import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Location, Settings } from '@/types/weather'

interface AppStore {
  location: Location | null
  setLocation: (loc: Location) => void
  favorites: Location[]
  addFavorite: (loc: Location) => void
  removeFavorite: (lat: number, lon: number) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  tempUnit: 'celsius',
  windUnit: 'kmh',
  pressureUnit: 'hpa',
  precipUnit: 'mm',
  timeFormat: '24h',
  language: 'de',
  animations: true,
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (loc) => set({ location: loc }),

      favorites: [],
      addFavorite: (loc) =>
        set((state) => {
          if (state.favorites.length >= 10) return state
          if (state.favorites.some((f) => Math.abs(f.lat - loc.lat) < 0.01 && Math.abs(f.lon - loc.lon) < 0.01)) return state
          return { favorites: [...state.favorites, loc] }
        }),
      removeFavorite: (lat, lon) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (f) => !(Math.abs(f.lat - lat) < 0.01 && Math.abs(f.lon - lon) < 0.01)
          ),
        })),

      activeTab: 'overview',
      setActiveTab: (tab) => set({ activeTab: tab }),

      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    {
      name: 'himmelblick-store',
      partialize: (state) => ({
        location: state.location,
        favorites: state.favorites,
        settings: state.settings,
      }),
    }
  )
)
