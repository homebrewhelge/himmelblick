import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { api } from '@/services/api'
import type { Location } from '@/types/weather'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const { searchOpen, setSearchOpen, setLocation, addFavorite, favorites } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  const requestIdRef = useRef(0)

  const search = useCallback((q: string) => {
    clearTimeout(timeoutRef.current)
    if (q.length < 2) { setResults([]); return }
    const requestId = ++requestIdRef.current
    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.geocode(q) as { results: Location[] }
        if (requestId === requestIdRef.current) setResults(res.results ?? [])
      } catch {
        if (requestId === requestIdRef.current) setResults([])
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    }, 350)
  }, [])

  const select = (loc: Location) => {
    setLocation(loc)
    setSearchOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.set('lat', loc.lat.toFixed(4))
    url.searchParams.set('lon', loc.lon.toFixed(4))
    url.searchParams.set('name', loc.name)
    window.history.replaceState({}, '', url.toString())
  }

  if (!searchOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
      <div className={styles.panel} role="dialog" aria-label="Ortssuche">
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            placeholder="Stadt, Ort oder PLZ suchen …"
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value) }}
            onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
          />
          {loading && <span className={styles.spinner} />}
          <button className={styles.closeBtn} onClick={() => setSearchOpen(false)}>✕</button>
        </div>

        {results.length > 0 && (
          <ul className={styles.results} role="listbox">
            {results.map((loc, i) => (
              <li key={loc.place_id ?? i}>
                <div
                  className={styles.resultItem}
                  onClick={() => select(loc)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(loc) } }}
                  role="option"
                  tabIndex={0}
                  aria-selected={false}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <div className={styles.resultText}>
                    <span className={styles.resultName}>{loc.short_name || loc.name}</span>
                    <span className={styles.resultFull}>{loc.name}</span>
                  </div>
                  <button
                    className={styles.favoriteBtn}
                    onClick={(e) => { e.stopPropagation(); addFavorite(loc) }}
                    title="Als Favorit speichern"
                    aria-label="Als Favorit speichern"
                  >
                    {favorites.some((f) => Math.abs(f.lat - loc.lat) < 0.01) ? '★' : '☆'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {favorites.length > 0 && (
          <div className={styles.favorites}>
            <span className={styles.favTitle}>Favoriten</span>
            <div className={styles.favList}>
              {favorites.map((fav, i) => (
                <button key={i} className={styles.favChip} onClick={() => select(fav)}>
                  ★ {fav.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
