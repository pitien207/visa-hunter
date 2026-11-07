import type { Outfit } from '../data/npcs'

/** A tiny face drawn from the same outfit data as the 3D chibi, for dialogue boxes. */
export function Portrait({ outfit, size = 64 }: { outfit: Outfit; size?: number }) {
  const { skin, hair, hairStyle, accessory, shirt } = outfit
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="#fff6e3" />
      <path d="M12 64c2-12 10-17 20-17s18 5 20 17z" fill={shirt} />
      {hairStyle === 'bun' && <circle cx="32" cy="9" r="7" fill={hair} />}
      <circle cx="32" cy="31" r="18" fill={skin} />
      {/* Hair cap (shorter for "short" style) */}
      <path
        d={hairStyle === 'short' ? 'M14 28c0-11 8-17 18-17s18 6 18 17c-4-5-10-7-18-7s-14 2-18 7z' : 'M13 33c-1-13 7-21 19-21s20 8 19 21c-2-6-6-10-10-11-4 3-13 4-20 2-4 2-7 5-8 9z'}
        fill={hair}
      />
      <circle cx="25.5" cy="32" r="2.3" fill="#2d2430" />
      <circle cx="38.5" cy="32" r="2.3" fill="#2d2430" />
      <circle cx="26.3" cy="31.2" r="0.8" fill="#ffffff" />
      <circle cx="39.3" cy="31.2" r="0.8" fill="#ffffff" />
      <ellipse cx="21.5" cy="37" rx="3" ry="1.8" fill="#ffa3b1" opacity="0.85" />
      <ellipse cx="42.5" cy="37" rx="3" ry="1.8" fill="#ffa3b1" opacity="0.85" />
      <path d="M29 39c1.5 2 4.5 2 6 0" fill="none" stroke="#c95b6e" strokeWidth="1.6" strokeLinecap="round" />
      {accessory === 'glasses' && (
        <g fill="none" stroke="#4a3b4a" strokeWidth="1.6">
          <circle cx="25.5" cy="32" r="4.6" />
          <circle cx="38.5" cy="32" r="4.6" />
          <path d="M30 32h4" />
        </g>
      )}
      {accessory === 'nonLa' && <path d="M4 22L32 3l28 19c-8 3-48 3-56 0z" fill="#f2d79c" stroke="#d9b878" strokeWidth="1.2" />}
      {accessory === 'beanie' && (
        <g>
          <path d="M13 27c0-11 8-17 19-17s19 6 19 17z" fill={outfit.accent ?? '#d4473b'} />
          <rect x="12" y="24" width="40" height="5" rx="2.5" fill="#fff6e3" />
          <circle cx="32" cy="9" r="4" fill="#fff6e3" />
        </g>
      )}
      {accessory === 'helmet' && <path d="M12 26c0-11 9-17 20-17s20 6 20 17z" fill={outfit.accent ?? '#ff9b8f'} stroke="#5b4636" strokeWidth="1" />}
    </svg>
  )
}
