import { useState } from 'react'
import { useForecast } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import { WeatherIcon } from '@/components/icons/WeatherIcon'
import { wmoIcon, wmoLabel, convertTemp, tempLabel } from '@/utils/weather'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import styles from './DailyForecast.module.css'


function moonPhaseIcon(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return '🌑'
  if (phase < 0.22) return '🌒'
  if (phase < 0.28) return '🌓'
  if (phase < 0.47) return '🌔'
  if (phase < 0.53) return '🌕'
  if (phase < 0.72) return '🌖'
  if (phase < 0.78) return '🌗'
  return '🌘'
}

export function DailyForecast() {
  const { location, settings } = useStore()
  const { data, isLoading } = useForecast(location, 14)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  if (!location) return null
  if (isLoading) return <div className={styles.skeleton} />

  const daily = data?.daily
  if (!daily) return null

  const tLabel = tempLabel(settings.tempUnit)

  return (
    <section className={styles.section} aria-label="14-Tage-Vorhersage">
      <h2 className={styles.title}>14-Tage-Vorhersage</h2>
      <div className={styles.grid}>
        {daily.time.map((time, i) => {
          const dt = parseISO(time)
          const isExpanded = expandedDay === i
          const tMax = convertTemp(daily.temperature_2m_max[i], settings.tempUnit)
          const tMin = convertTemp(daily.temperature_2m_min[i], settings.tempUnit)
          const code = daily.weathercode[i]
          const precip = daily.precipitation_sum[i]
          const precipProb = daily.precipitation_probability_max[i]
          const wind = daily.windspeed_10m_max[i]
          const sun = daily.sunshine_duration?.[i]
          const moonPhase = daily.moon_phase?.[i] ?? 0
          const uv = daily.uv_index_max?.[i]

          const sunHours = sun != null ? (sun / 3600).toFixed(1) : null
          const isToday = i === 0
          const isTomorrow = i === 1

          return (
            <div key={time} className={`${styles.dayCard} ${isToday ? styles.today : ''}`}>
              <button
                className={styles.dayHeader}
                onClick={() => setExpandedDay(isExpanded ? null : i)}
                aria-expanded={isExpanded}
              >
                <span className={styles.dayName}>
                  {isToday ? 'Heute' : isTomorrow ? 'Morgen' : format(dt, 'EEE', { locale: de })}
                </span>
                <span className={styles.dayDate}>{format(dt, 'd. MMM', { locale: de })}</span>
                <WeatherIcon icon={wmoIcon(code, true)} size={32} />
                <span className={styles.dayLabel}>{wmoLabel(code)}</span>
                <div className={styles.temps}>
                  <span className={styles.tMax}>{tMax}{tLabel}</span>
                  <span className={styles.tempBar}>
                    <TempBar min={tMin as number} max={tMax as number} absMin={-10} absMax={40} />
                  </span>
                  <span className={styles.tMin}>{tMin}{tLabel}</span>
                </div>
                {precip > 0.1 && (
                  <span className={styles.precip}>💧 {precip.toFixed(1)} mm ({precipProb}%)</span>
                )}
                {sunHours && (
                  <span className={styles.sun}>☀ {sunHours} h</span>
                )}
                <span className={styles.moon} title="Mondphase">{moonPhaseIcon(moonPhase)}</span>
              </button>

              {isExpanded && (
                <div className={styles.detail}>
                  <div className={styles.detailGrid}>
                    <span>Wind max.</span><span>{Math.round(wind)} km/h</span>
                    {uv != null && <><span>UV-Index max.</span><span>{uv.toFixed(0)}</span></>}
                    {daily.sunrise?.[i] && (
                      <><span>Sonnenaufgang</span><span>{format(parseISO(daily.sunrise[i]), 'HH:mm')}</span></>
                    )}
                    {daily.sunset?.[i] && (
                      <><span>Sonnenuntergang</span><span>{format(parseISO(daily.sunset[i]), 'HH:mm')}</span></>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TempBar({ min, max, absMin, absMax }: { min: number; max: number; absMin: number; absMax: number }) {
  const range = absMax - absMin
  const left = ((min - absMin) / range) * 100
  const width = ((max - min) / range) * 100

  return (
    <div className={styles.barTrack}>
      <div
        className={styles.barFill}
        style={{ left: `${Math.max(0, left)}%`, width: `${Math.min(100, width)}%` }}
      />
    </div>
  )
}
