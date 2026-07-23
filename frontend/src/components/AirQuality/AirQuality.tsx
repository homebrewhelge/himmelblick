import { useAirQuality } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import { aqiLabel } from '@/utils/weather'
import styles from './AirQuality.module.css'

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³', limit: 25 },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³', limit: 50 },
  { key: 'ozone', label: 'Ozon (O₃)', unit: 'µg/m³', limit: 120 },
  { key: 'nitrogen_dioxide', label: 'NO₂', unit: 'µg/m³', limit: 200 },
  { key: 'sulphur_dioxide', label: 'SO₂', unit: 'µg/m³', limit: 350 },
  { key: 'carbon_monoxide', label: 'CO', unit: 'µg/m³', limit: 10000 },
] as const

export function AirQuality() {
  const { location } = useStore()
  const { data, isLoading } = useAirQuality(location)

  if (!location) return null
  if (isLoading) return <div className={styles.skeleton} />

  const hourly = data?.hourly
  if (!hourly) return null

  // Aktuellsten Wert suchen
  const now = new Date()
  const idx = hourly.time.findIndex((t: string) => new Date(t) >= now)
  const i = idx >= 0 ? idx : 0

  const aqi = hourly.european_aqi?.[i] ?? 0
  const aqiInfo = aqiLabel(aqi)

  return (
    <section className={styles.section} aria-label="Luftqualität">
      <div className={styles.header}>
        <h2 className={styles.title}>Luftqualität</h2>
        <div
          className={styles.aqiBadge}
          style={{ background: aqiInfo.color }}
        >
          <span className={styles.aqiValue}>{aqi}</span>
          <span className={styles.aqiLabel}>{aqiInfo.label}</span>
        </div>
      </div>

      <div className={styles.pollutantGrid}>
        {POLLUTANTS.map(({ key, label, unit, limit }) => {
          const value = hourly[key]?.[i] ?? 0
          const percent = Math.min((value / limit) * 100, 100)
          const isHigh = percent > 80

          return (
            <div key={key} className={styles.pollutant}>
              <div className={styles.pollutantHeader}>
                <span className={styles.pollutantLabel}>{label}</span>
                <span className={`${styles.pollutantValue} ${isHigh ? styles.high : ''}`}>
                  {value.toFixed(1)} {unit}
                </span>
              </div>
              <div className={styles.pollutantBar}>
                <div
                  className={styles.pollutantFill}
                  style={{
                    width: `${percent}%`,
                    background: isHigh ? '#ef4444' : percent > 50 ? '#f97316' : '#22c55e',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
