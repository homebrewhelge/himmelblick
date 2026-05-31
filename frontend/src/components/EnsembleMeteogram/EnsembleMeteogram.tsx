import React, { Suspense, lazy, useState } from 'react'
import { useEnsemble } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import styles from './EnsembleMeteogram.module.css'

const EnsembleChart = lazy(() => import('./EnsembleChart'))

const MODEL_LABELS: Record<string, string> = {
  icon_seamless: 'ICON (DWD)',
  ecmwf_ifs025: 'ECMWF IFS',
  gfs_seamless: 'GFS',
  ukmo_seamless: 'UKMO',
  meteofrance_seamless: 'Météo-France',
  arpae_cosmo_seamless: 'ARPAE',
  knmi_seamless: 'KNMI',
}

const MODEL_COLORS: Record<string, string> = {
  icon_seamless: '#60a5fa',
  ecmwf_ifs025: '#34d399',
  gfs_seamless: '#f59e0b',
  ukmo_seamless: '#a78bfa',
  meteofrance_seamless: '#fb7185',
  arpae_cosmo_seamless: '#22d3ee',
  knmi_seamless: '#86efac',
}

export function EnsembleMeteogram() {
  const { location, settings } = useStore()
  const { data, isLoading, isError } = useEnsemble(location)
  const [hiddenModels, setHiddenModels] = useState<Set<string>>(new Set())
  const [variable, setVariable] = useState<'temperature_2m' | 'precipitation'>('temperature_2m')

  if (!location) return null

  const toggleModel = (model: string) => {
    setHiddenModels((prev) => {
      const next = new Set(prev)
      next.has(model) ? next.delete(model) : next.add(model)
      return next
    })
  }

  return (
    <section className={styles.section} aria-label="Ensemble-Meteogramm">
      <div className={styles.header}>
        <h2 className={styles.title}>Ensemble-Meteogramm</h2>
        <p className={styles.subtitle}>
          Spaghetti-Plot aller verfügbaren Wettermodelle — breite Streuung = höhere Unsicherheit
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.varToggle}>
          <button
            className={`${styles.varBtn} ${variable === 'temperature_2m' ? styles.active : ''}`}
            onClick={() => setVariable('temperature_2m')}
          >
            Temperatur
          </button>
          <button
            className={`${styles.varBtn} ${variable === 'precipitation' ? styles.active : ''}`}
            onClick={() => setVariable('precipitation')}
          >
            Niederschlag
          </button>
        </div>

        <div className={styles.modelLegend}>
          {Object.entries(MODEL_LABELS).map(([key, label]) => {
            const isHidden = hiddenModels.has(key)
            const failed = data?.failed_models?.includes(key)
            return (
              <button
                key={key}
                className={`${styles.modelChip} ${isHidden ? styles.modelHidden : ''} ${failed ? styles.modelFailed : ''}`}
                onClick={() => toggleModel(key)}
                style={{ '--model-color': MODEL_COLORS[key] } as React.CSSProperties}
                title={failed ? 'Modell nicht verfügbar' : (isHidden ? 'Einblenden' : 'Ausblenden')}
                disabled={failed}
              >
                <span className={styles.modelDot} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading && <div className={styles.skeleton} />}
      {isError && (
        <div className={styles.error}>Ensemble-Daten konnten nicht geladen werden.</div>
      )}
      {!isLoading && !isError && data && (
        <Suspense fallback={<div className={styles.skeleton} />}>
          <EnsembleChart
            data={data}
            variable={variable}
            hiddenModels={hiddenModels}
            modelColors={MODEL_COLORS}
            settings={settings}
          />
        </Suspense>
      )}
    </section>
  )
}
