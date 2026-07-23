import { useEffect, Suspense, lazy } from 'react'
import { useStore } from '@/store'
import { useLocation } from '@/hooks/useLocation'
import { Header } from '@/components/Header/Header'
import { SearchBar } from '@/components/SearchBar/SearchBar'
import { WeatherHero } from '@/components/WeatherHero/WeatherHero'
import { WarningBanner } from '@/components/WarningBanner/WarningBanner'
import styles from './App.module.css'

const HourlyForecast = lazy(() => import('@/components/HourlyForecast/HourlyForecast').then((m) => ({ default: m.HourlyForecast })))
const DailyForecast = lazy(() => import('@/components/DailyForecast/DailyForecast').then((m) => ({ default: m.DailyForecast })))
const EnsembleMeteogram = lazy(() => import('@/components/EnsembleMeteogram/EnsembleMeteogram').then((m) => ({ default: m.EnsembleMeteogram })))
const RadarMap = lazy(() => import('@/components/RadarMap/RadarMap').then((m) => ({ default: m.RadarMap })))
const AirQuality = lazy(() => import('@/components/AirQuality/AirQuality').then((m) => ({ default: m.AirQuality })))
const Astronomy = lazy(() => import('@/components/Astronomy/Astronomy').then((m) => ({ default: m.Astronomy })))
const ClimateHistory = lazy(() => import('@/components/ClimateHistory/ClimateHistory').then((m) => ({ default: m.ClimateHistory })))
const BioWeather = lazy(() => import('@/components/BioWeather/BioWeather').then((m) => ({ default: m.BioWeather })))

export default function App() {
  const { activeTab, settings, location: loc, setSearchOpen } = useStore()
  const { requestGeolocation, setFromUrlParams } = useLocation()

  // Beim Start URL-Parameter prüfen, dann Geolokation versuchen
  useEffect(() => {
    const hasUrlParams = setFromUrlParams()
    if (!hasUrlParams) {
      requestGeolocation()
      // Suchfeld öffnen wenn nach kurzer Wartezeit noch kein Standort ermittelt wurde
      setTimeout(() => {
        if (!useStore.getState().location) setSearchOpen(true)
      }, 500)
    }
  }, [requestGeolocation, setFromUrlParams, setSearchOpen])

  // Theme-Klasse auf <html> setzen
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  return (
    <div className={`${styles.app} ${!settings.animations ? styles.noAnimations : ''}`}>
      <Header />
      <SearchBar />

      <main className={styles.main}>
        {!loc ? (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>🌤</div>
            <h1 className={styles.welcomeTitle}>Willkommen bei HimmelBlick</h1>
            <p className={styles.welcomeText}>Wähle einen Standort um das Wetter zu sehen</p>
            <button className={styles.welcomeBtn} onClick={() => setSearchOpen(true)}>
              Standort wählen
            </button>
          </div>
        ) : (
          <>
            <WarningBanner />

            {activeTab === 'overview' && (
              <>
                <WeatherHero />
                <Suspense fallback={<LoadingSection />}>
                  <HourlyForecast />
                </Suspense>
                <Suspense fallback={<LoadingSection />}>
                  <DailyForecast />
                </Suspense>
              </>
            )}

            {activeTab === 'hourly' && (
              <Suspense fallback={<LoadingSection />}><HourlyForecast /></Suspense>
            )}

            {activeTab === 'daily' && (
              <Suspense fallback={<LoadingSection />}><DailyForecast /></Suspense>
            )}

            {activeTab === 'ensemble' && (
              <Suspense fallback={<LoadingSection />}><EnsembleMeteogram /></Suspense>
            )}

            {activeTab === 'radar' && (
              <Suspense fallback={<LoadingSection />}><RadarMap /></Suspense>
            )}

            {activeTab === 'climate' && (
              <Suspense fallback={<LoadingSection />}><ClimateHistory /></Suspense>
            )}

            {activeTab === 'airquality' && (
              <Suspense fallback={<LoadingSection />}><AirQuality /></Suspense>
            )}

            {activeTab === 'astronomy' && (
              <Suspense fallback={<LoadingSection />}><Astronomy /></Suspense>
            )}

            {activeTab === 'biowetter' && (
              <Suspense fallback={<LoadingSection />}><BioWeather /></Suspense>
            )}
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <span>Daten: Open-Meteo · DWD · Brightsky · OSM</span>
        <span>HimmelBlick v1.0</span>
      </footer>
    </div>
  )
}

function LoadingSection() {
  return <div className={styles.loadingSection} aria-busy="true" aria-label="Wird geladen" />
}
