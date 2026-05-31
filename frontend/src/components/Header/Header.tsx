import React from 'react'
import { useStore } from '@/store'
import { useWarnings } from '@/hooks/useWeatherData'
import styles from './Header.module.css'

const TABS = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'hourly', label: 'Stündlich' },
  { id: 'daily', label: '14 Tage' },
  { id: 'ensemble', label: 'Ensemble' },
  { id: 'radar', label: 'Radar' },
  { id: 'climate', label: 'Klima' },
  { id: 'airquality', label: 'Luft' },
  { id: 'astronomy', label: 'Astronomie' },
  { id: 'biowetter', label: 'Biowetter' },
]

export function Header() {
  const { location, setSearchOpen, activeTab, setActiveTab } = useStore()
  const { data: warningData } = useWarnings(location)
  const warnings = warningData?.warnings ?? []
  const maxLevel = warnings.reduce((m: number, w: { level: number }) => Math.max(m, w.level), 0)

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 28 28" className={styles.logo}>
            <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="14" cy="10" r="5" fill="currentColor" opacity="0.9" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line key={deg} x1="14" y1="2" x2="14" y2="5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                transform={`rotate(${deg} 14 14)`} />
            ))}
          </svg>
          <span className={styles.brandName}>HimmelBlick</span>
        </div>

        <div className={styles.actions}>
          {maxLevel >= 2 && (
            <div
              className={styles.warnBadge}
              style={{ background: maxLevel >= 4 ? '#ef4444' : maxLevel >= 3 ? '#f97316' : '#fbbf24' }}
              title={`${warnings.length} aktive Unwetterwarnung(en)`}
            >
              ⚠ {warnings.length}
            </div>
          )}

          <button
            className={styles.searchBtn}
            onClick={() => setSearchOpen(true)}
            aria-label="Ort suchen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className={styles.locationLabel}>{location?.name ?? 'Ort wählen'}</span>
          </button>

          <SettingsButton />
        </div>
      </div>

      <nav className={styles.tabs} role="tablist" aria-label="Wetter-Bereiche">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

function SettingsButton() {
  const { settings, updateSettings } = useStore()

  const cycleTheme = () => {
    const themes: ('auto' | 'light' | 'dark' | 'storm')[] = ['auto', 'light', 'dark', 'storm']
    const next = themes[(themes.indexOf(settings.theme) + 1) % themes.length]
    updateSettings({ theme: next })
  }

  const themeIcon = { auto: '🌗', light: '☀', dark: '🌙', storm: '⛈' }[settings.theme]

  return (
    <button
      className={styles.themeBtn}
      onClick={cycleTheme}
      title={`Theme: ${settings.theme}`}
      aria-label="Theme wechseln"
    >
      {themeIcon}
    </button>
  )
}
