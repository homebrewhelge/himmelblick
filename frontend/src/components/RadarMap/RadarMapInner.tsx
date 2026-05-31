import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from 'react-query'
import { api } from '@/services/api'
import type { Location } from '@/types/weather'
import styles from './RadarMapInner.module.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  location: Location
}

const RADIUS_OPTIONS = [5, 10, 25]

// Imperatively managed WMS layer — react-leaflet's WMSTileLayer
// does not reliably update the TIME parameter on re-render.
function WmsOverlay({
  url, layer, timestamp, showWind,
}: { url: string; layer: string; timestamp?: string; showWind: boolean }) {
  const map = useMap()
  const radarRef = useRef<L.TileLayer.WMS | null>(null)
  const windRef = useRef<L.TileLayer.WMS | null>(null)

  useEffect(() => {
    const radar = L.tileLayer.wms(url, {
      layers: layer,
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      opacity: 0.7,
      attribution: '&copy; DWD',
      ...(timestamp ? { TIME: timestamp } : {}),
    } as any)
    radar.addTo(map)
    radarRef.current = radar

    const wind = L.tileLayer.wms(url, {
      layers: 'dwd:icon_reg025_fd_sl_uv10m_wmc_windbarbs',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      opacity: 0.8,
      attribution: '&copy; DWD',
    } as any)
    if (showWind) wind.addTo(map)
    windRef.current = wind

    return () => {
      radar.remove()
      wind.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update radar TIME parameter when frame changes
  useEffect(() => {
    if (!radarRef.current) return
    radarRef.current.setParams({ TIME: timestamp ?? '' } as any)
  }, [timestamp])

  // Toggle wind layer
  useEffect(() => {
    if (!windRef.current) return
    if (showWind) {
      windRef.current.addTo(map)
    } else {
      windRef.current.remove()
    }
  }, [showWind, map])

  return null
}

export default function RadarMapInner({ location }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)
  const [speed, setSpeed] = useState(500)
  const [radius, setRadius] = useState(10)
  const [showWind, setShowWind] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const { data: animData } = useQuery('radar-animation', () => api.radarAnimation(), {
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })

  const frames = animData?.frames ?? []
  const currentFrame = frames[frameIndex]

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setFrameIndex((i) => (i + 1) % frames.length)
      }, speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, frames.length, speed])

  const wmsUrl = animData?.wms_url ?? 'https://maps.dwd.de/geoserver/dwd/wms'
  const wmsLayer = animData?.wms_layer ?? 'dwd:Niederschlagsradar'

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <button
          className={styles.playBtn}
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause' : 'Abspielen'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className={styles.frameLabel}>
          {currentFrame?.label ?? '--:--'}
        </span>
        <div className={styles.frameBar}>
          {frames.map((_, i) => (
            <button
              key={i}
              className={`${styles.frameDot} ${i === frameIndex ? styles.frameDotActive : ''}`}
              onClick={() => { setIsPlaying(false); setFrameIndex(i) }}
              aria-label={`Frame ${i + 1}`}
            />
          ))}
        </div>
        <select
          className={styles.speedSelect}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Geschwindigkeit"
        >
          <option value={1000}>Langsam</option>
          <option value={500}>Normal</option>
          <option value={250}>Schnell</option>
        </select>
        <button
          className={`${styles.radiusBtn} ${showWind ? styles.radiusBtnActive : ''}`}
          onClick={() => setShowWind((v) => !v)}
          title="Windpfeile ein/aus"
        >
          💨 Wind
        </button>
        <div className={styles.radiusToggle}>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              className={`${styles.radiusBtn} ${r === radius ? styles.radiusBtnActive : ''}`}
              onClick={() => setRadius(r)}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <MapContainer
        center={[location.lat, location.lon]}
        zoom={9}
        className={styles.map}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <WmsOverlay
          url={wmsUrl}
          layer={wmsLayer}
          timestamp={currentFrame?.timestamp}
          showWind={showWind}
        />
        <Marker position={[location.lat, location.lon]}>
          <Popup>{location.name}</Popup>
        </Marker>
        <Circle
          center={[location.lat, location.lon]}
          radius={radius * 1000}
          pathOptions={{ color: '#60a5fa', fillOpacity: 0.05, weight: 1.5 }}
        />
        <MapRecenter lat={location.lat} lon={location.lon} />
      </MapContainer>

      <div className={styles.legend}>
        <span className={styles.legendTitle}>mm/h</span>
        <div className={styles.legendBar} />
        <span className={styles.legendMin}>0</span>
        <span className={styles.legendMax}>≥10</span>
      </div>
    </div>
  )
}

function MapRecenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom())
  }, [lat, lon, map])
  return null
}
