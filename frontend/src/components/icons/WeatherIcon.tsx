import { useStore } from '@/store'

interface Props {
  icon: string
  size?: number
  className?: string
  animate?: boolean
}

export function WeatherIcon({ icon, size = 48, className = '', animate }: Props) {
  const { settings } = useStore()
  const shouldAnimate = animate !== false && settings.animations

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`weather-icon weather-icon--${icon} ${shouldAnimate ? 'animated' : ''} ${className}`}
      aria-hidden="true"
    >
      {renderIcon(icon)}
    </svg>
  )
}

function renderIcon(icon: string) {
  switch (icon) {
    case 'clear':
      return (
        <g className="icon-sun">
          <circle cx="24" cy="24" r="9" fill="currentColor" opacity="0.9" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="24" y1="6" x2="24" y2="11"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              transform={`rotate(${deg} 24 24)`}
            />
          ))}
        </g>
      )
    case 'clear-night':
      return (
        <path
          d="M30 8a16 16 0 0 0-16 16 16 16 0 0 0 16 16 16 16 0 0 0 8-2.15A13 13 0 0 1 22 24a13 13 0 0 1 10.15-12.85A16 16 0 0 0 30 8z"
          fill="currentColor"
        />
      )
    case 'partly-cloudy':
      return (
        <g>
          <g className="icon-sun" style={{ transformOrigin: '16px 18px' }}>
            <circle cx="16" cy="18" r="6" fill="currentColor" opacity="0.85" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line key={deg} x1="16" y1="7" x2="16" y2="11"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                transform={`rotate(${deg} 16 18)`} />
            ))}
          </g>
          <rect x="8" y="26" width="32" height="14" rx="7" fill="currentColor" opacity="0.6" />
          <rect x="14" y="21" width="20" height="12" rx="6" fill="currentColor" opacity="0.8" />
        </g>
      )
    case 'partly-cloudy-night':
      return (
        <g>
          <path
            d="M18 6a10 10 0 0 0-10 10 10 10 0 0 0 5 8.66A8 8 0 0 1 15 16a8 8 0 0 1 6.3-7.84A10 10 0 0 0 18 6z"
            fill="currentColor" opacity="0.85"
          />
          <rect x="8" y="28" width="32" height="13" rx="6.5" fill="currentColor" opacity="0.6" />
          <rect x="14" y="23" width="20" height="12" rx="6" fill="currentColor" opacity="0.8" />
        </g>
      )
    case 'overcast':
    case 'mostly-clear':
      return (
        <g>
          <rect x="4" y="28" width="40" height="14" rx="7" fill="currentColor" opacity="0.5" />
          <rect x="10" y="21" width="28" height="14" rx="7" fill="currentColor" opacity="0.7" />
          <rect x="16" y="15" width="20" height="14" rx="7" fill="currentColor" opacity="0.9" />
        </g>
      )
    case 'fog':
      return (
        <g>
          {[14, 20, 26, 32].map((y) => (
            <rect key={y} x="6" y={y} width="36" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
          ))}
        </g>
      )
    case 'drizzle':
      return (
        <g>
          <rect x="10" y="10" width="28" height="14" rx="7" fill="currentColor" opacity="0.7" />
          <g className="icon-rain" fill="currentColor" opacity="0.7">
            {[[14, 32], [22, 30], [30, 32], [18, 38], [26, 36]].map(([x, y]) => (
              <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.5" ry="2.5" />
            ))}
          </g>
        </g>
      )
    case 'rain':
    case 'showers':
      return (
        <g>
          <rect x="8" y="10" width="32" height="14" rx="7" fill="currentColor" opacity="0.75" />
          <g className="icon-rain" fill="currentColor" opacity="0.8">
            {[[12, 32], [20, 28], [28, 32], [36, 28], [16, 38], [24, 36], [32, 40]].map(([x, y]) => (
              <line key={`${x}-${y}`} x1={x} y1={y} x2={x - 2} y2={y + 5}
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ))}
          </g>
        </g>
      )
    case 'rain-heavy':
    case 'showers-heavy':
      return (
        <g>
          <rect x="6" y="8" width="36" height="15" rx="7.5" fill="currentColor" opacity="0.8" />
          <g className="icon-rain-heavy" fill="currentColor">
            {[[10, 30], [18, 26], [26, 30], [34, 26], [14, 38], [22, 34], [30, 38], [38, 34]].map(([x, y]) => (
              <line key={`${x}-${y}`} x1={x} y1={y} x2={x - 3} y2={y + 6}
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            ))}
          </g>
        </g>
      )
    case 'snow':
    case 'snow-showers':
      return (
        <g>
          <rect x="8" y="8" width="32" height="14" rx="7" fill="currentColor" opacity="0.7" />
          <g className="icon-snow" fill="currentColor" opacity="0.85">
            {[[14, 30], [24, 26], [34, 30], [19, 38], [29, 36]].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`}>
                <circle cx={cx} cy={cy} r="2.5" />
                <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="currentColor" strokeWidth="1.5" />
                <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="currentColor" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        </g>
      )
    case 'snow-heavy':
      return (
        <g>
          <rect x="6" y="6" width="36" height="15" rx="7.5" fill="currentColor" opacity="0.75" />
          <g className="icon-snow">
            {[[12, 30], [20, 26], [28, 30], [36, 26], [16, 39], [24, 36], [32, 39]].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`} fill="currentColor" opacity="0.85">
                <circle cx={cx} cy={cy} r="2.5" />
                <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="currentColor" strokeWidth="1.5" />
                <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="currentColor" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        </g>
      )
    case 'thunderstorm':
    case 'thunderstorm-hail':
      return (
        <g>
          <rect x="6" y="6" width="36" height="14" rx="7" fill="currentColor" opacity="0.8" />
          <g className="icon-lightning">
            <polygon points="26,22 18,34 24,34 20,46 32,30 26,30 30,22" fill="#fbbf24" opacity="0.95" />
          </g>
          {icon === 'thunderstorm-hail' && (
            <g fill="currentColor" opacity="0.7">
              {[[10, 36], [38, 38]].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.5" />
              ))}
            </g>
          )}
        </g>
      )
    default:
      return (
        <g>
          <rect x="8" y="14" width="32" height="20" rx="10" fill="currentColor" opacity="0.5" />
          <text x="24" y="28" textAnchor="middle" fontSize="10" fill="currentColor">?</text>
        </g>
      )
  }
}
