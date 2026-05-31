import React from 'react'
import { useAstronomy } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import { formatTime } from '@/utils/weather'
import styles from './Astronomy.module.css'

export function Astronomy() {
  const { location, settings } = useStore()
  const { data, isLoading } = useAstronomy(location)

  if (!location) return null
  if (isLoading) return <div className={styles.skeleton} />
  if (!data) return null

  const fmt = (t: string | null) => t ? formatTime(t, settings.timeFormat) : '–'

  return (
    <section className={styles.section} aria-label="Astronomie">
      <h2 className={styles.title}>Astronomie</h2>

      <div className={styles.grid}>
        <AstroCard title="Sonne" icon="☀">
          <Row label="Aufgang" value={fmt(data.sunrise)} />
          <Row label="Untergang" value={fmt(data.sunset)} />
          <Row label="Tageslänge" value={data.day_length_formatted ?? '–'} />
          <Row label="Goldene Stunde" value={`${fmt(data.golden_hour_morning)} / ${fmt(data.golden_hour_evening)}`} />
        </AstroCard>

        <AstroCard title="Dämmerung" icon="🌅">
          <Row label="Bürgerlich" value={`${fmt(data.civil_dawn)} – ${fmt(data.civil_dusk)}`} />
          <Row label="Nautisch" value={`${fmt(data.nautical_dawn)} – ${fmt(data.nautical_dusk)}`} />
          <Row label="Astronomisch" value={`${fmt(data.astronomical_dawn)} – ${fmt(data.astronomical_dusk)}`} />
        </AstroCard>

        <AstroCard title="Mond" icon={moonEmoji(data.moon_phase)}>
          <Row label="Aufgang" value={fmt(data.moonrise)} />
          <Row label="Untergang" value={fmt(data.moonset)} />
          <Row label="Phase" value={data.moon_phase_name} />
          <Row label="Beleuchtung" value={`${data.moon_illumination}%`} />
          <MoonPhaseVisual phase={data.moon_phase} />
        </AstroCard>

        <AstroCard title="Finsternisse" icon="🔭">
          <Row label="Nächste Sonnenfinsternis" value={data.next_solar_eclipse ?? 'Unbekannt'} />
          <Row label="Nächste Mondfinsternis" value={data.next_lunar_eclipse ?? 'Unbekannt'} />
          {data.elevation?.elevation != null && (
            <Row label="Standorthöhe" value={`${data.elevation.elevation} m ü.NN`} />
          )}
        </AstroCard>
      </div>
    </section>
  )
}

function AstroCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>{icon}</span>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  )
}

function MoonPhaseVisual({ phase }: { phase: number }) {
  // Zeichnet eine animierte Mondphase als SVG
  const illuminated = phase <= 0.5 ? phase * 2 : (1 - phase) * 2
  const isWaxing = phase < 0.5

  return (
    <div className={styles.moonVisual}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="#1e293b" />
        {/* Mondphasen-Approximation */}
        <ellipse
          cx="24"
          cy="24"
          rx={20 * illuminated}
          ry="20"
          fill="#e2e8f0"
          opacity="0.9"
          transform={isWaxing ? undefined : 'scale(-1 1) translate(-48 0)'}
        />
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </svg>
    </div>
  )
}

function moonEmoji(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return '🌑'
  if (phase < 0.22) return '🌒'
  if (phase < 0.28) return '🌓'
  if (phase < 0.47) return '🌔'
  if (phase < 0.53) return '🌕'
  if (phase < 0.72) return '🌖'
  if (phase < 0.78) return '🌗'
  return '🌘'
}
