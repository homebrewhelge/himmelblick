import React, { Suspense, lazy } from 'react'
import { useHistorical } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import styles from './ClimateHistory.module.css'

const ClimateChart = lazy(() => import('./ClimateChart'))

export function ClimateHistory() {
  const { location, settings } = useStore()
  const { data, isLoading } = useHistorical(location, 30)

  if (!location) return null
  if (isLoading) return <div className={styles.skeleton} />
  if (!data?.daily) return null

  const daily = data.daily
  const temps = daily.temperature_2m_max.filter((v: number) => v != null)
  const precipSum = daily.precipitation_sum?.reduce((a: number, b: number) => a + b, 0) ?? 0
  const maxTemp = Math.max(...temps)
  const minTemp = Math.min(...(daily.temperature_2m_min ?? temps))

  const hotDay = daily.time[daily.temperature_2m_max.indexOf(maxTemp)]
  const rainDay = daily.precipitation_sum
    ? daily.time[daily.precipitation_sum.indexOf(Math.max(...daily.precipitation_sum))]
    : null

  return (
    <section className={styles.section} aria-label="Klimatologie der letzten 30 Tage">
      <h2 className={styles.title}>Letzte 30 Tage</h2>

      <div className={styles.extremes}>
        <div className={styles.extremeCard}>
          <span className={styles.extremeIcon}>🌡</span>
          <span className={styles.extremeLabel}>Höchste Temperatur</span>
          <span className={styles.extremeValue}>{maxTemp.toFixed(1)} °C</span>
          {hotDay && <span className={styles.extremeDate}>{new Date(hotDay).toLocaleDateString('de-DE')}</span>}
        </div>
        <div className={styles.extremeCard}>
          <span className={styles.extremeIcon}>🥶</span>
          <span className={styles.extremeLabel}>Tiefste Temperatur</span>
          <span className={styles.extremeValue}>{minTemp.toFixed(1)} °C</span>
        </div>
        <div className={styles.extremeCard}>
          <span className={styles.extremeIcon}>💧</span>
          <span className={styles.extremeLabel}>Gesamtniederschlag</span>
          <span className={styles.extremeValue}>{precipSum.toFixed(1)} mm</span>
        </div>
        {rainDay && (
          <div className={styles.extremeCard}>
            <span className={styles.extremeIcon}>🌧</span>
            <span className={styles.extremeLabel}>Stärkster Regentag</span>
            <span className={styles.extremeDate}>{new Date(rainDay).toLocaleDateString('de-DE')}</span>
          </div>
        )}
      </div>

      <Suspense fallback={<div className={styles.chartSkeleton} />}>
        <ClimateChart daily={daily} settings={settings} />
      </Suspense>
    </section>
  )
}
