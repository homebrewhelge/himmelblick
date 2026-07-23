import styles from './WindCompass.module.css'

interface Props {
  direction: number
  speed: number
}

export function WindCompass({ direction, speed }: Props) {
  return (
    <div className={styles.compass} title={`Wind aus ${direction}°`}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        {/* Kompassring */}
        <circle cx="36" cy="36" r="34" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <circle cx="36" cy="36" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />

        {/* Himmelsrichtungen */}
        {[
          { label: 'N', x: 36, y: 8 },
          { label: 'O', x: 64, y: 38 },
          { label: 'S', x: 36, y: 66 },
          { label: 'W', x: 8, y: 38 },
        ].map(({ label, x, y }) => (
          <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fill="currentColor" opacity="0.6" fontFamily="DM Sans, sans-serif">
            {label}
          </text>
        ))}

        {/* Windpfeil — zeigt die Richtung AUS der der Wind kommt */}
        <g transform={`rotate(${direction} 36 36)`}>
          <polygon
            points="36,10 41,32 36,28 31,32"
            fill="currentColor"
            opacity="0.9"
          />
          <polygon
            points="36,62 41,40 36,44 31,40"
            fill="currentColor"
            opacity="0.3"
          />
        </g>

        {/* Windgeschwindigkeit in der Mitte */}
        <text x="36" y="35" textAnchor="middle" fontSize="9" fontWeight="600"
          fill="currentColor" fontFamily="Syne, sans-serif">
          {Math.round(speed)}
        </text>
        <text x="36" y="44" textAnchor="middle" fontSize="7"
          fill="currentColor" opacity="0.6" fontFamily="DM Sans, sans-serif">
          km/h
        </text>
      </svg>
    </div>
  )
}
