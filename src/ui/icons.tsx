import type { SVGProps } from 'react'

/** Small original inline icons (no icon font / library download). */

type IconProps = SVGProps<SVGSVGElement>

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/** Gear outline generated from polar points: 8 rounded teeth. */
const GEAR_PATH = (() => {
  const teeth = 8
  const step = (Math.PI * 2) / teeth
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    for (const [r, da] of [
      [7.4, -0.36],
      [10, -0.2],
      [10, 0.2],
      [7.4, 0.36],
    ] as const) {
      const ang = a + da * step
      pts.push(`${(12 + Math.cos(ang) * r).toFixed(2)},${(12 + Math.sin(ang) * r).toFixed(2)}`)
    }
  }
  return `M${pts.join('L')}Z`
})()

export function GearIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d={GEAR_PATH} />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function MusicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 17.5V5.5l11-2v12" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="15.5" r="2.5" />
    </Svg>
  )
}

export function MusicOffIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 17.5V5.5l11-2v12" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="15.5" r="2.5" />
      <path d="M3 3l18 18" />
    </Svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  )
}

/** Old Vietnamese copper coin (đồng xu) with a square hole. */
export function CoinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="#f4c04e" stroke="#b9822a" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#ffe6a6" strokeWidth="1.4" />
      <rect x="9.2" y="9.2" width="5.6" height="5.6" rx="0.6" fill="#fff6e3" stroke="#b9822a" strokeWidth="1.6" />
    </svg>
  )
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <path
        d="M13.5 2 4.5 13.5h6.5L9.5 22l10-12.5h-6.5L13.5 2Z"
        fill="#f4c04e"
        stroke="#b9822a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Mood face: smiles, flat or sad depending on the value (0–100). */
export function MoodIcon({ value, ...props }: IconProps & { value: number }) {
  const mouth = value >= 60 ? 'M8 13.5c1.2 2 6.8 2 8 0' : value >= 35 ? 'M8.5 14.5h7' : 'M8 15.5c1.2-2 6.8-2 8 0'
  const fill = value >= 60 ? '#ffb3c7' : value >= 35 ? '#ffe08a' : '#b8d0f0'
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill={fill} stroke="#5b4636" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.3" fill="#5b4636" />
      <circle cx="15" cy="10" r="1.3" fill="#5b4636" />
      <path d={mouth} fill="none" stroke="#5b4636" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Woven bag (túi đồ). */
export function BagIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 8V7a4 4 0 0 1 8 0v1" />
      <path d="M4.5 8h15l-1.2 11.5a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8z" fill="#f4c04e" />
      <path d="M8 12v5M12 12v5M16 12v5" stroke="#9e6a1f" strokeWidth={1.6} />
    </Svg>
  )
}

export function RainIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M7 15.5a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.2a3.7 3.7 0 0 1 .4 7.3z" fill="#eef3fb" stroke="#9fb0c8" strokeWidth="1.4" strokeLinejoin="round" />
      <g stroke="#7fb2ff" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8.5 18l-.8 2.4M12.5 18l-.8 2.4M16.5 18l-.8 2.4" />
      </g>
    </svg>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <g stroke="#f4c04e" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </g>
      <circle cx="12" cy="12" r="5" fill="#ffe08a" stroke="#f4c04e" strokeWidth="1.6" />
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>
      <path d="M16 18A8 8 0 0 1 9.5 4.5 8.5 8.5 0 1 0 19.5 14.5 8 8 0 0 1 16 18z" fill="#ffe08a" stroke="#b9822a" strokeWidth="1.4" />
    </svg>
  )
}
