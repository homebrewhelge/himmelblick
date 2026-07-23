import { Suspense, lazy } from 'react'
import { useStore } from '@/store'
import styles from './RadarMap.module.css'

const RadarMapInner = lazy(() => import('./RadarMapInner'))

export function RadarMap() {
  const { location } = useStore()

  if (!location) return null

  return (
    <section className={styles.section} aria-label="Radar-Karte">
      <h2 className={styles.title}>Niederschlagsradar</h2>
      <Suspense fallback={<div className={styles.skeleton}>Karte wird geladen …</div>}>
        <RadarMapInner location={location} />
      </Suspense>
    </section>
  )
}
