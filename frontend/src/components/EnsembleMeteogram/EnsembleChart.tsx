import { useMemo, useRef } from 'react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { convertTemp, tempLabel } from '@/utils/weather'
import type { EnsembleData, Settings } from '@/types/weather'
import styles from './EnsembleChart.module.css'

interface Props {
  data: EnsembleData
  variable: 'temperature_2m' | 'precipitation'
  hiddenModels: Set<string>
  modelColors: Record<string, string>
  settings: Settings
}

export default function EnsembleChart({ data, variable, hiddenModels, modelColors, settings }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const models = Object.entries(data.models).filter(([key]) => !hiddenModels.has(key))
    if (models.length === 0) return []

    // Gemeinsame Zeitachse aus erstem Modell
    const firstModel = models[0][1]
    const times = firstModel.hourly.time

    return times.map((time, i) => {
      const row: Record<string, string | number> = {
        time,
        label: format(parseISO(time), 'EE HH:mm'),
      }

      const values: number[] = []
      for (const [key, model] of models) {
        const raw = model.hourly[variable]?.[i]
        if (raw == null) continue
        const val = variable === 'temperature_2m'
          ? (convertTemp(raw, settings.tempUnit) as number)
          : raw
        row[key] = val
        values.push(val)
      }

      // Statistik für Unsicherheitsband
      if (values.length > 0) {
        values.sort((a, b) => a - b)
        row.p10 = values[Math.floor(values.length * 0.1)]
        row.p90 = values[Math.floor(values.length * 0.9)]
        row.median = values[Math.floor(values.length * 0.5)]

        // Spread-Qualität
        const spread = (row.p90 as number) - (row.p10 as number)
        row.spread = spread
        row.spreadLevel = spread < 1 ? 0 : spread < 3 ? 1 : 2
      }

      return row
    })
  }, [data, variable, hiddenModels, settings])

  const activeModels = Object.keys(data.models).filter((k) => !hiddenModels.has(k) && data.models[k])
  const tLabel = variable === 'temperature_2m' ? tempLabel(settings.tempUnit) : 'mm'

  const handleDownload = () => {
    alert('Screenshot: Rechtsklick auf den Chart → "Bild speichern unter"')
  }

  return (
    <div className={styles.wrapper} ref={chartRef}>
      <div className={styles.spreadLegend}>
        <span className={styles.spreadGood}>◉ &lt;1° Abweichung</span>
        <span className={styles.spreadMid}>◉ 1–3° Abweichung</span>
        <span className={styles.spreadHigh}>◉ &gt;3° Abweichung</span>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          ⬇ PNG
        </button>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -5 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            interval={11}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}${tLabel}`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#e2e8f0',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'p10' || name === 'p90') return null
              if (name === 'median') return [`${value}${tLabel}`, 'Median']
              return [`${value}${tLabel}`, name]
            }}
          />

          {/* Unsicherheitsband (10.–90. Perzentil) */}
          <Area
            dataKey="p90"
            fill="rgba(99,102,241,0.1)"
            stroke="none"
            activeDot={false}
          />
          <Area
            dataKey="p10"
            fill="rgba(15,23,42,0.5)"
            stroke="none"
            activeDot={false}
          />

          {/* Spaghetti-Linien aller Modelle */}
          {activeModels.map((key) => (
            <Line
              key={key}
              dataKey={key}
              stroke={modelColors[key] ?? '#94a3b8'}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
              opacity={0.75}
            />
          ))}

          {/* Median hervorgehoben */}
          <Line
            dataKey="median"
            stroke="#f8fafc"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, fill: '#f8fafc' }}
            strokeDasharray="0"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
