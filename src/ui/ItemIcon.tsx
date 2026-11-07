import type { JSX, SVGProps } from 'react'
import type { ItemIconName } from '../data/items'

/** Original food & drink icons (referenced by name from data/items.ts). */

type Props = SVGProps<SVGSVGElement>
const INK = '#5b4636'

function Base({ children, ...props }: Props) {
  return (
    <svg viewBox="0 0 32 32" width="1em" height="1em" aria-hidden="true" strokeLinejoin="round" strokeLinecap="round" {...props}>
      {children}
    </svg>
  )
}

function BanhMi(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 19c0-5 6-10 14-11 6-1 10 2 10 5 0 5-7 11-15 12-6 .7-9-2-9-6z" fill="#f2b45c" stroke={INK} strokeWidth="2" />
      <path d="M10 14l3 2M15 11.5l3 2M20 10l3 2" stroke="#c97b2b" strokeWidth="2" />
      <path d="M7 21c4 1 11-1 16-6" fill="none" stroke="#7fc27a" strokeWidth="2.4" />
      <path d="M8 22.5c4 .5 9-1 13-4" fill="none" stroke="#e05a4a" strokeWidth="2" />
    </Base>
  )
}

function TraDa(props: Props) {
  return (
    <Base {...props}>
      <path d="M8 7h16l-2 19a2 2 0 0 1-2 1.8h-8A2 2 0 0 1 10 26z" fill="#e8f4f8" stroke={INK} strokeWidth="2" />
      <path d="M9.2 13h13.6l-1.5 13a1.5 1.5 0 0 1-1.5 1.3h-7.6A1.5 1.5 0 0 1 10.7 26z" fill="#d8a24e" />
      <rect x="12" y="14.5" width="4" height="4" rx="1" fill="#ffffff" opacity="0.8" />
      <rect x="16.5" y="17" width="4" height="4" rx="1" fill="#ffffff" opacity="0.8" />
    </Base>
  )
}

function MiGoi(props: Props) {
  return (
    <Base {...props}>
      <path d="M5 8l2-3h18l2 3-1 16 1 3H5l1-3z" fill="#f7c948" stroke={INK} strokeWidth="2" />
      <circle cx="16" cy="16" r="6" fill="#fff6e3" stroke={INK} strokeWidth="1.6" />
      <path d="M12.5 15c1-1 2 1 3.5 0s2.5 1 3.5 0M12.5 18c1-1 2 1 3.5 0s2.5 1 3.5 0" fill="none" stroke="#d4473b" strokeWidth="1.4" />
    </Base>
  )
}

function BanhBao(props: Props) {
  return (
    <Base {...props}>
      <path d="M5 21c0-7 5-13 11-13s11 6 11 13c0 3-5 5-11 5S5 24 5 21z" fill="#fffaf0" stroke={INK} strokeWidth="2" />
      <path d="M16 8c-1 3-1 5 0 7M12 10c0 3 1 5 3 6M20 10c0 3-1 5-3 6" fill="none" stroke="#e6d6b8" strokeWidth="1.6" />
      <circle cx="16" cy="9" r="1.6" fill="#d4473b" />
    </Base>
  )
}

function Xoi(props: Props) {
  return (
    <Base {...props}>
      <path d="M3 19l13-12 13 12-13 9z" fill="#7fc27a" stroke={INK} strokeWidth="2" />
      <ellipse cx="16" cy="18" rx="8" ry="5" fill="#fff3c4" stroke={INK} strokeWidth="1.6" />
      <circle cx="13" cy="17" r="1.2" fill="#e8b84a" />
      <circle cx="17" cy="16" r="1.2" fill="#e8b84a" />
      <circle cx="19" cy="19" r="1.2" fill="#e8b84a" />
    </Base>
  )
}

function NuocMia(props: Props) {
  return (
    <Base {...props}>
      <path d="M9 9h14l-1.8 18a2 2 0 0 1-2 1.8h-6.4a2 2 0 0 1-2-1.8z" fill="#e9f5d0" stroke={INK} strokeWidth="2" />
      <path d="M10 14h12l-1.3 13a1.5 1.5 0 0 1-1.5 1.3h-6.4a1.5 1.5 0 0 1-1.5-1.3z" fill="#b8d96a" />
      <path d="M18 3l-2 11" stroke="#d4473b" strokeWidth="2.2" />
      <path d="M22 5l3-2" stroke="#7fc27a" strokeWidth="2.4" />
    </Base>
  )
}

function TangLuc(props: Props) {
  return (
    <Base {...props}>
      <rect x="9" y="4" width="14" height="24" rx="3" fill="#d4473b" stroke={INK} strokeWidth="2" />
      <path d="M9 9h14M9 23h14" stroke="#9e2f27" strokeWidth="2" />
      <path d="M17 11l-4 6h3l-1 5 4-6h-3z" fill="#ffe08a" />
    </Base>
  )
}

function Broetchen(props: Props) {
  return (
    <Base {...props}>
      <ellipse cx="16" cy="18" rx="12" ry="8" fill="#e8a25a" stroke={INK} strokeWidth="2" />
      <path d="M10 15c4 3 8 3 12 0" fill="none" stroke="#b9732f" strokeWidth="2" />
      <circle cx="12" cy="20" r="0.8" fill="#fff6e3" />
      <circle cx="17" cy="21" r="0.8" fill="#fff6e3" />
      <circle cx="21" cy="19" r="0.8" fill="#fff6e3" />
    </Base>
  )
}

function Brezel(props: Props) {
  return (
    <Base {...props}>
      <path d="M8 22c-5-4-3-14 4-12 3 1 4 5 4 8 0-3 1-7 4-8 7-2 9 8 4 12-3 3-8 2-8-2 0 4-5 5-8 2z" fill="none" stroke="#a8622a" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="11" cy="14" r="0.9" fill="#ffffff" />
      <circle cx="21" cy="14" r="0.9" fill="#ffffff" />
      <circle cx="16" cy="21" r="0.9" fill="#ffffff" />
    </Base>
  )
}

function Doener(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 10c0-4 20-4 20 0l-4 18H10z" fill="#f2c27a" stroke={INK} strokeWidth="2" />
      <path d="M8 11c4 2 12 2 16 0" fill="none" stroke="#a8622a" strokeWidth="3" />
      <path d="M9 15h14" stroke="#7fc27a" strokeWidth="2.4" />
      <path d="M10 18h12" stroke="#e05a4a" strokeWidth="2" />
    </Base>
  )
}

function Schorle(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 3h8v5l3 4v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V12l3-4z" fill="#f6d27a" stroke={INK} strokeWidth="2" />
      <rect x="10" y="15" width="12" height="7" rx="1" fill="#7fc27a" />
      <circle cx="16" cy="18.5" r="2" fill="#e05a4a" />
    </Base>
  )
}

function Kaffee(props: Props) {
  return (
    <Base {...props}>
      <path d="M9 9h14l-2 19H11z" fill="#fff6e3" stroke={INK} strokeWidth="2" />
      <rect x="8" y="6" width="16" height="4" rx="1.5" fill="#c97b4a" stroke={INK} strokeWidth="1.6" />
      <path d="M10 16h12" stroke="#c97b4a" strokeWidth="4" />
    </Base>
  )
}

function Pizza(props: Props) {
  return (
    <Base {...props}>
      <path d="M16 4l12 22H4z" fill="#f6d27a" stroke={INK} strokeWidth="2" />
      <path d="M5 24h22" stroke="#c97b4a" strokeWidth="3" />
      <circle cx="16" cy="13" r="2" fill="#e05a4a" />
      <circle cx="12" cy="19" r="2" fill="#e05a4a" />
      <circle cx="20" cy="20" r="1.6" fill="#7fc27a" />
    </Base>
  )
}

function Kuchen(props: Props) {
  return (
    <Base {...props}>
      <path d="M5 14l22-6v14H5z" fill="#f6e4c0" stroke={INK} strokeWidth="2" />
      <path d="M5 14l22-6v4L5 18z" fill="#e8a25a" />
      <path d="M8 20h4M15 20h4M22 19h3" stroke="#c97b4a" strokeWidth="1.6" />
    </Base>
  )
}

const ICONS: Record<ItemIconName, (props: Props) => JSX.Element> = {
  broetchen: Broetchen,
  brezel: Brezel,
  doener: Doener,
  schorle: Schorle,
  kaffee: Kaffee,
  pizza: Pizza,
  kuchen: Kuchen,
  banhMi: BanhMi,
  traDa: TraDa,
  miGoi: MiGoi,
  banhBao: BanhBao,
  xoi: Xoi,
  nuocMia: NuocMia,
  tangLuc: TangLuc,
}

export function ItemIcon({ name, ...props }: Props & { name: ItemIconName }) {
  const Icon = ICONS[name]
  return <Icon {...props} />
}
