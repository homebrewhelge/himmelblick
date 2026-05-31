import React, { useState, useEffect } from 'react'
import { useWarnings } from '@/hooks/useWeatherData'
import { useStore } from '@/store'
import type { Warning } from '@/types/weather'
import styles from './WarningBanner.module.css'

const LEVEL_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Vorabinformation', color: '#ffffff', bg: '#64748b' },
  2: { label: 'Warnung', color: '#000000', bg: '#fbbf24' },
  3: { label: 'Markante Warnung', color: '#ffffff', bg: '#f97316' },
  4: { label: 'Unwetterwarnung', color: '#ffffff', bg: '#ef4444' },
  5: { label: 'Extremes Unwetter', color: '#ffffff', bg: '#7c3aed' },
}

export function WarningBanner() {
  const { location } = useStore()
  const { data } = useWarnings(location)
  const [expanded, setExpanded] = useState<number | null>(null)

  const warnings: Warning[] = data?.warnings ?? []
  const maxLevel = warnings.reduce((m, w) => Math.max(m, w.level), 0)

  useEffect(() => {
    if (maxLevel >= 3 && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted' && warnings.some((w) => w.level >= 3)) {
          new Notification('⚠ DWD-Unwetterwarnung', {
            body: warnings.find((w) => w.level >= 3)?.headline ?? '',
            icon: '/favicon.svg',
          })
        }
      })
    }
  }, [maxLevel])

  if (warnings.length === 0) return null

  return (
    <div className={styles.wrapper} role="alert" aria-live="polite">
      {warnings.map((w, i) => {
        const cfg = LEVEL_CONFIG[w.level] ?? LEVEL_CONFIG[1]
        const isOpen = expanded === i

        return (
          <div
            key={i}
            className={styles.warning}
            style={{ '--warn-bg': cfg.bg, '--warn-color': cfg.color } as React.CSSProperties}
          >
            <button
              className={styles.warningHeader}
              onClick={() => setExpanded(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className={styles.levelBadge}>{cfg.label}</span>
              <span className={styles.headline}>{w.headline || w.event}</span>
              {w.start && (
                <span className={styles.time}>
                  {new Date(w.start).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  {w.end ? ` – ${new Date(w.end).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' })}` : ''}
                </span>
              )}
              <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className={styles.detail}>
                {w.description && <p>{w.description}</p>}
                {w.instruction && (
                  <p className={styles.instruction}>
                    <strong>Empfehlung:</strong> {w.instruction}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
