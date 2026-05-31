import React from 'react'
import { useCurrentWeather } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import { convertTemp, tempLabel } from '@/utils/weather'
import styles from './BioWeather.module.css'

export function BioWeather() {
  const { location, settings } = useStore()
  const { data, isLoading } = useCurrentWeather(location)

  if (!location) return null
  if (isLoading) return <div className={styles.skeleton} />

  const bio = data?.bio
  const current = data?.current ?? {}
  if (!bio) return null

  const tLabel = tempLabel(settings.tempUnit)
  const temp = current.temperature_2m ?? 0
  const humidity = current.relativehumidity_2m ?? 0
  const uv = current.uv_index ?? 0

  const indices = [
    {
      label: 'Hitzeindex',
      value: bio.heat_index != null ? `${convertTemp(bio.heat_index, settings.tempUnit)}${tLabel}` : '–',
      description: 'Gefühlte Hitze durch Kombination von Temperatur und Luftfeuchte (Rothfusz)',
      available: bio.heat_index != null,
      warn: bio.heat_index != null && bio.heat_index > 40,
    },
    {
      label: 'Windchill',
      value: bio.windchill != null ? `${convertTemp(bio.windchill, settings.tempUnit)}${tLabel}` : '–',
      description: 'Gefühlte Kälte durch Windabkühlung (JAG/TI-Methode)',
      available: bio.windchill != null,
      warn: false,
    },
    {
      label: 'Humidex',
      value: bio.humidex != null ? `${convertTemp(bio.humidex, settings.tempUnit)}${tLabel}` : '–',
      description: 'Kanadischer Komfortindex aus Temperatur und Taupunkt',
      available: bio.humidex != null,
      warn: bio.humidex != null && bio.humidex > 40,
    },
    {
      label: 'PET (Gefühlte Außentemp.)',
      value: bio.pet != null ? `${convertTemp(bio.pet, settings.tempUnit)}${tLabel}` : '–',
      description: 'Physiological Equivalent Temperature — bioklimatischer Komfortindex',
      available: bio.pet != null,
      warn: bio.pet != null && (bio.pet > 41 || bio.pet < -13),
    },
  ]

  return (
    <section className={styles.section} aria-label="Biowetter">
      <h2 className={styles.title}>Biowetter & Komfortindizes</h2>
      <p className={styles.subtitle}>Alle Werte für aktuellen Standort und aktuelle Bedingungen</p>

      <div className={styles.grid}>
        {indices.map((idx) => (
          <div
            key={idx.label}
            className={`${styles.card} ${!idx.available ? styles.unavailable : ''} ${idx.warn ? styles.warn : ''}`}
          >
            <div className={styles.cardLabel}>{idx.label}</div>
            <div className={styles.cardValue}>{idx.value}</div>
            <div className={styles.cardDesc}>{idx.description}</div>
            {!idx.available && (
              <div className={styles.cardNote}>Nicht anwendbar bei aktuellen Bedingungen</div>
            )}
          </div>
        ))}
      </div>

      {bio.recommendations && bio.recommendations.length > 0 && (
        <div className={styles.recs}>
          <h3 className={styles.recsTitle}>Alltagsempfehlungen</h3>
          <div className={styles.recGrid}>
            {bio.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`${styles.rec} ${rec.ok ? styles.recOk : styles.recBad}`}
              >
                <span className={styles.recIcon}>{rec.icon}</span>
                <span className={styles.recLabel}>{rec.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
