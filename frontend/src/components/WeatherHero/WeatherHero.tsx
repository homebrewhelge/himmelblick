import React from 'react'
import { useCurrentWeather } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import { WeatherIcon } from '@/components/icons/WeatherIcon'
import { wmoLabel, wmoIcon, convertTemp, tempLabel, convertWind, windLabel, windDirectionLabel, uvIndexLabel } from '@/utils/weather'
import { WeatherBackground } from './WeatherBackground'
import { WindCompass } from './WindCompass'
import styles from './WeatherHero.module.css'

export function WeatherHero() {
  const { location, settings } = useStore()
  const { data, isLoading, isError, dataUpdatedAt } = useCurrentWeather(location)

  if (!location) return null

  if (isLoading) {
    return (
      <div className={styles.skeleton}>
        <div className={styles.skeletonTemp} />
        <div className={styles.skeletonLabel} />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className={styles.error}>
        <p>Wetterdaten konnten nicht geladen werden.</p>
        <button onClick={() => window.location.reload()}>Erneut versuchen</button>
      </div>
    )
  }

  const current = data.current ?? {}
  const bio = data.bio ?? {}

  const temp = current.temperature_2m ?? 0
  const apparent = current.apparent_temperature ?? temp
  const code = current.weathercode ?? 0
  const isDay = (current.is_day ?? 1) === 1
  const wind = current.windspeed_10m ?? 0
  const windDir = current.winddirection_10m ?? 0
  const gusts = current.windgusts_10m ?? 0
  const humidity = current.relativehumidity_2m ?? 0
  const pressure = current.pressure_msl ?? 0
  const visibility = current.visibility ?? 0
  const uv = current.uv_index ?? 0
  const dewpoint = current.dewpoint_2m ?? 0

  const uvInfo = uvIndexLabel(uv)
  const displayTemp = convertTemp(temp, settings.tempUnit)
  const displayApparent = convertTemp(apparent, settings.tempUnit)
  const tLabel = tempLabel(settings.tempUnit)
  const displayWind = convertWind(wind, settings.windUnit)
  const wLabel = windLabel(settings.windUnit)

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <section className={styles.hero} aria-label="Aktuelles Wetter">
      <WeatherBackground code={code} isDay={isDay} />

      <div className={styles.topRow}>
        <div className={styles.locationName}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span>{location.name}</span>
          {location.elevation != null && (
            <span className={styles.elevation}>{location.elevation} m ü.NN</span>
          )}
        </div>
        {updatedAt && (
          <span className={styles.updatedAt}>Daten vom {updatedAt} Uhr</span>
        )}
      </div>

      <div className={styles.mainBlock}>
        <div className={styles.iconAndTemp}>
          <WeatherIcon icon={wmoIcon(code, isDay)} size={96} className={styles.mainIcon} />
          <div className={styles.tempBlock}>
            <span className={styles.temperature}>{displayTemp}{tLabel}</span>
            <span className={styles.weatherLabel}>{wmoLabel(code)}</span>
            <span className={styles.apparentTemp}>
              Gefühlt {displayApparent}{tLabel}
            </span>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <DetailCard label="Luftfeuchte" value={`${humidity}%`} icon="💧"
            sub={`Taupunkt ${convertTemp(dewpoint, settings.tempUnit)}${tLabel}`} />
          <DetailCard label="Luftdruck" value={`${Math.round(pressure)} hPa`} icon="🌡" />
          <DetailCard label="Sichtweite" value={`${(visibility / 1000).toFixed(1)} km`} icon="👁" />
          <DetailCard label="UV-Index" value={`${uv.toFixed(0)}`} icon="☀"
            sub={uvInfo.label}
            valueColor={uvInfo.color} />
          {bio.heat_index != null && (
            <DetailCard label="Hitzeindex" value={`${convertTemp(bio.heat_index, settings.tempUnit)}${tLabel}`} icon="🌡" />
          )}
          {bio.windchill != null && (
            <DetailCard label="Windchill" value={`${convertTemp(bio.windchill, settings.tempUnit)}${tLabel}`} icon="🥶" />
          )}
        </div>
      </div>

      <div className={styles.windRow}>
        <WindCompass direction={windDir} speed={wind} />
        <div className={styles.windDetails}>
          <span className={styles.windSpeed}>{displayWind} {wLabel}</span>
          <span className={styles.windDir}>{windDirectionLabel(windDir)}</span>
          <span className={styles.windGusts}>Böen {convertWind(gusts, settings.windUnit)} {wLabel}</span>
        </div>
      </div>

      {bio.recommendations && bio.recommendations.length > 0 && (
        <div className={styles.chips} role="list" aria-label="Empfehlungen">
          {bio.recommendations.map((rec) => (
            <span
              key={rec.id}
              className={`${styles.chip} ${rec.ok ? styles.chipOk : styles.chipBad}`}
              role="listitem"
            >
              {rec.label}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

function DetailCard({ label, value, icon, sub, valueColor }: {
  label: string; value: string; icon: string; sub?: string; valueColor?: string
}) {
  return (
    <div className={styles.detailCard}>
      <span className={styles.detailIcon}>{icon}</span>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue} style={valueColor ? { color: valueColor } : undefined}>{value}</span>
      {sub && <span className={styles.detailSub}>{sub}</span>}
    </div>
  )
}
