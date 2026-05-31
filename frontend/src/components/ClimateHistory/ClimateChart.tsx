import React from 'react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { convertTemp, tempLabel } from '@/utils/weather'
import type { Settings } from '@/types/weather'
import styles from './ClimateChart.module.css'

interface Props {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    sunshine_duration?: number[]
  }
  settings: Settings
}

export default function ClimateChart({ daily, settings }: Props) {
  const data = daily.time.map((t, i) => ({
    label: format(parseISO(t), 'd.M.', { locale: de }),
    tMax: convertTemp(daily.temperature_2m_max[i], settings.tempUnit),
    tMin: convertTemp(daily.temperature_2m_min[i], settings.tempUnit),
    precip: daily.precipitation_sum?.[i] ?? 0,
    sun: daily.sunshine_duration?.[i] != null ? daily.sunshine_duration[i] / 3600 : null,
  }))

  const tLabel = tempLabel(settings.tempUnit)

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            yAxisId="temp"
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}${tLabel}`}
          />
          <YAxis
            yAxisId="precip"
            orientation="right"
            tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}mm`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#e2e8f0',
            }}
          />
          <Bar yAxisId="precip" dataKey="precip" fill="rgba(59,130,246,0.4)" radius={[2, 2, 0, 0]} name="Niederschlag (mm)" />
          <Line yAxisId="temp" dataKey="tMax" stroke="#f87171" strokeWidth={2} dot={false} name={`T-Max (${tLabel})`} />
          <Line yAxisId="temp" dataKey="tMin" stroke="#60a5fa" strokeWidth={2} dot={false} name={`T-Min (${tLabel})`} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
