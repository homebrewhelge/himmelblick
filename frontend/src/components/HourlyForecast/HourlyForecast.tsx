import React, { Suspense, lazy } from 'react'
import { useHourlyForecast } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import { WeatherIcon } from '@/components/icons/WeatherIcon'
import { wmoIcon, convertTemp, tempLabel, windDirectionLabel } from '@/utils/weather'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import styles from './HourlyForecast.module.css'

const HourlyChart = lazy(() => import('./HourlyChart'))

export function HourlyForecast() {
  const { location, settings } = useStore()
  const { data, isLoading } = useHourlyForecast(location, 48)

  if (!location) return null
  if (isLoading) return <div className={styles.skeleton} />

  const hourly = data?.hourly
  if (!hourly) return null

  const hours = hourly.time.slice(0, 48)

  return (
    <section className={styles.section} aria-label="Stündliche Vorhersage">
      <h2 className={styles.title}>48-Stunden-Vorhersage</h2>

      <Suspense fallback={<div className={styles.chartSkeleton} />}>
        <HourlyChart hourly={hourly} settings={settings} />
      </Suspense>

      <div className={styles.scroll} role="list">
        {hours.map((time, i) => {
          const dt = parseISO(time)
          const isDay = (hourly.is_day?.[i] ?? 1) === 1
          const temp = convertTemp(hourly.temperature_2m[i], settings.tempUnit)
          const code = hourly.weathercode[i]
          const precip = hourly.precipitation[i]
          const precipProb = hourly.precipitation_probability?.[i]
          const wind = hourly.windspeed_10m[i]
          const windDir = hourly.winddirection_10m[i]

          const isNewDay = i > 0 && dt.getHours() === 0
          const isSunrise = i > 0 && hourly.is_day?.[i] === 1 && hourly.is_day?.[i - 1] === 0
          const isSunset = i > 0 && hourly.is_day?.[i] === 0 && hourly.is_day?.[i - 1] === 1

          return (
            <React.Fragment key={time}>
              {isNewDay && (
                <div className={styles.dayDivider}>
                  {format(dt, 'EEEE, d. MMMM', { locale: de })}
                </div>
              )}
              {(isSunrise || isSunset) && (
                <div className={styles.sunEvent}>
                  {isSunrise ? '🌅 Sonnenaufgang' : '🌇 Sonnenuntergang'} ~{format(dt, 'HH:mm')}
                </div>
              )}
              <div className={styles.hourCard} role="listitem">
                <span className={styles.hourTime}>{format(dt, 'HH:mm')}</span>
                <WeatherIcon icon={wmoIcon(code, isDay)} size={28} />
                <span className={styles.hourTemp}>{temp}{tempLabel(settings.tempUnit)}</span>
                {precip > 0.1 && (
                  <span className={styles.hourPrecip}>
                    💧 {precip.toFixed(1)} mm
                    {precipProb != null && ` (${precipProb}%)`}
                  </span>
                )}
                {precip <= 0.1 && precipProb != null && precipProb > 20 && (
                  <span className={styles.hourPrecipProb}>{precipProb}%</span>
                )}
                <span className={styles.hourWind}>
                  <WindArrow direction={windDir} speed={wind} />
                  {Math.round(wind)} km/h {windDirectionLabel(windDir)}
                </span>
                <CloudBar
                  low={hourly.cloudcover_low?.[i] ?? 0}
                  mid={hourly.cloudcover_mid?.[i] ?? 0}
                  high={hourly.cloudcover_high?.[i] ?? 0}
                />
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </section>
  )
}

function WindArrow({ direction, speed }: { direction: number; speed: number }) {
  const opacity = Math.min(0.4 + speed / 100, 1)
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ opacity, display: 'inline-block' }}>
      <polygon
        points="8,2 10.5,12 8,10 5.5,12"
        fill="currentColor"
        transform={`rotate(${direction} 8 8)`}
      />
    </svg>
  )
}

function CloudBar({ low, mid, high }: { low: number; mid: number; high: number }) {
  return (
    <div className={styles.cloudBar} title={`Bewölkung: niedrig ${low}% / mittel ${mid}% / hoch ${high}%`}>
      <div className={`${styles.cloudLayer} ${styles.cloudHigh}`} style={{ opacity: high / 100 }} />
      <div className={`${styles.cloudLayer} ${styles.cloudMid}`} style={{ opacity: mid / 100 }} />
      <div className={`${styles.cloudLayer} ${styles.cloudLow}`} style={{ opacity: low / 100 }} />
    </div>
  )
}
