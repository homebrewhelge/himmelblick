import React from 'react'
import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { convertTemp, tempLabel } from '@/utils/weather'
import type { Settings } from '@/types/weather'
import styles from './HourlyChart.module.css'

interface Props {
  hourly: {
    time: string[]
    temperature_2m: number[]
    apparent_temperature: number[]
    precipitation: number[]
    precipitation_probability: number[]
    is_day: number[]
    sunshine_duration: number[]
  }
  settings: Settings
}

export default function HourlyChart({ hourly, settings }: Props) {
  const data = hourly.time.slice(0, 48).map((t, i) => ({
    time: t,
    label: format(parseISO(t), 'HH:mm'),
    temp: convertTemp(hourly.temperature_2m[i], settings.tempUnit) as number,
    apparent: convertTemp(hourly.apparent_temperature[i], settings.tempUnit) as number,
    precip: hourly.precipitation[i],
    precipProb: hourly.precipitation_probability?.[i] ?? 0,
    isDay: hourly.is_day?.[i] ?? 1,
  }))

  const sunriseIndices = data
    .map((d, i) => ({ i, d }))
    .filter(({ i, d }) => i > 0 && d.isDay === 1 && data[i - 1]?.isDay === 0)
    .map(({ d }) => d.time)

  const sunsetIndices = data
    .map((d, i) => ({ i, d }))
    .filter(({ i, d }) => i > 0 && d.isDay === 0 && data[i - 1]?.isDay === 1)
    .map(({ d }) => d.time)

  const tLabel = tempLabel(settings.tempUnit)

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            yAxisId="temp"
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}${tLabel}`}
          />
          <YAxis
            yAxisId="precip"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}mm`}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#e2e8f0',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'temp') return [`${value}${tLabel}`, 'Temperatur']
              if (name === 'apparent') return [`${value}${tLabel}`, 'Gefühlt']
              if (name === 'precip') return [`${value} mm`, 'Niederschlag']
              if (name === 'precipProb') return [`${value}%`, 'Wahrscheinlichkeit']
              return [value, name]
            }}
          />

          {/* Sonnenauf-/-untergang als vertikale Linien */}
          {sunriseIndices.map((t) => (
            <ReferenceLine key={`sr-${t}`} x={format(parseISO(t), 'HH:mm')} yAxisId="temp"
              stroke="#fbbf24" strokeDasharray="4 2" strokeWidth={1.5} opacity={0.6} />
          ))}
          {sunsetIndices.map((t) => (
            <ReferenceLine key={`ss-${t}`} x={format(parseISO(t), 'HH:mm')} yAxisId="temp"
              stroke="#f97316" strokeDasharray="4 2" strokeWidth={1.5} opacity={0.6} />
          ))}

          {/* Gefühlte Temperatur als Fläche */}
          <Area
            yAxisId="temp"
            dataKey="apparent"
            fill="rgba(99,102,241,0.15)"
            stroke="rgba(99,102,241,0.5)"
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />

          {/* Temperaturkurve */}
          <Line
            yAxisId="temp"
            dataKey="temp"
            stroke="#60a5fa"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#60a5fa' }}
          />

          {/* Niederschlagsbalken */}
          <Bar
            yAxisId="precip"
            dataKey="precip"
            fill="rgba(59,130,246,0.5)"
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
