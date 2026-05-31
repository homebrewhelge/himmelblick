import React from 'react'
import { getWeatherBackground } from '@/utils/weather'
import styles from './WeatherBackground.module.css'

interface Props {
  code: number
  isDay: boolean
}

export function WeatherBackground({ code, isDay }: Props) {
  const bg = getWeatherBackground(code, isDay)

  return (
    <div className={`${styles.background} ${styles[bg]}`} aria-hidden="true">
      {bg === 'sunny' && <SunnyLayers />}
      {bg === 'partly-cloudy' && <PartlyCloudyLayers />}
      {bg === 'rainy' && <RainyLayers />}
      {bg === 'stormy' && <StormyLayers />}
      {bg === 'snowy' && <SnowyLayers />}
      {bg === 'night' && <NightLayers />}
    </div>
  )
}

function SunnyLayers() {
  return (
    <>
      <div className={styles.sunGlow} />
      <div className={styles.sunRays} />
    </>
  )
}

function PartlyCloudyLayers() {
  return (
    <>
      <div className={styles.sunGlowSmall} />
      <div className={`${styles.cloud} ${styles.cloud1}`} />
      <div className={`${styles.cloud} ${styles.cloud2}`} />
    </>
  )
}

function RainyLayers() {
  return (
    <>
      <div className={`${styles.cloud} ${styles.cloudDark1}`} />
      <div className={`${styles.cloud} ${styles.cloudDark2}`} />
      <div className={styles.rain}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.raindrop} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
          }} />
        ))}
      </div>
    </>
  )
}

function StormyLayers() {
  return (
    <>
      <div className={`${styles.cloud} ${styles.cloudStorm1}`} />
      <div className={`${styles.cloud} ${styles.cloudStorm2}`} />
      <div className={styles.lightning} />
      <div className={styles.rain}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className={styles.raindropHeavy} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1}s`,
            animationDuration: `${0.3 + Math.random() * 0.3}s`,
          }} />
        ))}
      </div>
    </>
  )
}

function SnowyLayers() {
  return (
    <>
      <div className={`${styles.cloud} ${styles.cloudSnow1}`} />
      <div className={styles.snow}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className={styles.snowflake} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}>❄</div>
        ))}
      </div>
    </>
  )
}

function NightLayers() {
  return (
    <>
      <div className={styles.stars}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className={styles.star} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>
      <div className={styles.moon} />
    </>
  )
}
