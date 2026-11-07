import type { JSX, SVGProps } from 'react'
import type { ActionIconName } from '../data/tasks'

/** Colourful original icons for context actions (referenced by name from data/tasks.ts). */

type Props = SVGProps<SVGSVGElement>
const INK = '#5b4636'

function Base({ children, ...props }: Props) {
  return (
    <svg viewBox="0 0 32 32" width="1em" height="1em" aria-hidden="true" strokeLinejoin="round" strokeLinecap="round" {...props}>
      {children}
    </svg>
  )
}

/** Barista apron. */
function StartIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M11 4h10v5l5 3v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V12l5-3z" fill="#ffc3a0" stroke={INK} strokeWidth="2" />
      <path d="M11 4c0 3 2 5 5 5s5-2 5-5" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="11" y="17" width="10" height="6" rx="2" fill="#fffaf2" stroke={INK} strokeWidth="1.8" />
    </Base>
  )
}

/** Glass of coffee under a little phin filter. */
function CoffeeIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M9 13h14l-1.6 14a2 2 0 0 1-2 1.8h-6.8a2 2 0 0 1-2-1.8z" fill="#bfe6f2" stroke={INK} strokeWidth="2" />
      <path d="M10 18h12l-1 9a1.5 1.5 0 0 1-1.5 1.3h-7a1.5 1.5 0 0 1-1.5-1.3z" fill="#6b4226" />
      <rect x="11" y="5" width="10" height="6" rx="1.5" fill="#dfe6ee" stroke={INK} strokeWidth="2" />
      <path d="M8 11h16" stroke={INK} strokeWidth="2" />
      <path d="M16 11v3" stroke="#6b4226" strokeWidth="2" />
    </Base>
  )
}

/** Tin of condensed milk. */
function MilkIcon(props: Props) {
  return (
    <Base {...props}>
      <ellipse cx="16" cy="8" rx="9" ry="3" fill="#dfe6ee" stroke={INK} strokeWidth="2" />
      <path d="M7 8v16c0 1.7 4 3 9 3s9-1.3 9-3V8" fill="#fff3dc" stroke={INK} strokeWidth="2" />
      <path d="M7 13c0 1.7 4 3 9 3s9-1.3 9-3v6c0 1.7-4 3-9 3s-9-1.3-9-3z" fill="#7fb8e8" />
      <circle cx="16" cy="18" r="2.2" fill="#fffaf2" />
    </Base>
  )
}

/** Ice cube. */
function IceIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M16 4l11 6v12l-11 6-11-6V10z" fill="#c9ecff" stroke={INK} strokeWidth="2" />
      <path d="M5 10l11 6 11-6M16 16v12" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M9 13l3 1.6" stroke="#ffffff" strokeWidth="2.4" />
    </Base>
  )
}

/** Salt shaker. */
function SaltIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M10 12h12l1.5 14a2 2 0 0 1-2 2.2h-11a2 2 0 0 1-2-2.2z" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <path d="M11 12c0-4 2-7 5-7s5 3 5 7" fill="#cdb8f0" stroke={INK} strokeWidth="2" />
      <circle cx="14" cy="8.5" r="0.9" fill={INK} />
      <circle cx="18" cy="8.5" r="0.9" fill={INK} />
      <circle cx="16" cy="6.8" r="0.9" fill={INK} />
      <path d="M12 19h8" stroke="#ff9fb2" strokeWidth="2.4" />
    </Base>
  )
}

/** Two speech bubbles. */
function TalkIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-6l-5 4v-4.3A4 4 0 0 1 4 13z" fill="#fff6e3" stroke={INK} strokeWidth="2" />
      <circle cx="9.5" cy="10.5" r="1.4" fill={INK} />
      <circle cx="13" cy="10.5" r="1.4" fill={INK} />
      <circle cx="16.5" cy="10.5" r="1.4" fill={INK} />
      <path d="M24 12h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3v3l-4-3h-5" fill="#a8e6cf" stroke={INK} strokeWidth="2" />
    </Base>
  )
}

/** Market basket. */
function ShopIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M10 13c0-4 2.6-7 6-7s6 3 6 7" fill="none" stroke={INK} strokeWidth="2.2" />
      <path d="M5 13h22l-2.4 12a2.5 2.5 0 0 1-2.5 2H9.9a2.5 2.5 0 0 1-2.5-2z" fill="#f4c04e" stroke={INK} strokeWidth="2" />
      <path d="M11 17v6M16 17v6M21 17v6" stroke="#9e6a1f" strokeWidth="2" />
    </Base>
  )
}

/** Crescent moon with stars. */
function SleepIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M21 22.5A10 10 0 0 1 12.5 6a10 10 0 1 0 12.4 12.4A10 10 0 0 1 21 22.5z" fill="#ffe08a" stroke={INK} strokeWidth="2" />
      <path d="M22 5l.8 1.8L25 7.5l-2.2.8L22 10l-.8-1.7L19 7.5l2.2-.7z" fill="#ffffff" stroke={INK} strokeWidth="1.2" />
    </Base>
  )
}

/** Notebook with a bookmark (save). */
function SaveIcon(props: Props) {
  return (
    <Base {...props}>
      <rect x="7" y="4" width="18" height="24" rx="3" fill="#a9d6ff" stroke={INK} strokeWidth="2" />
      <path d="M11 4v24" stroke={INK} strokeWidth="2" />
      <path d="M16 4v9l2.5-2 2.5 2V4" fill="#d4473b" stroke={INK} strokeWidth="1.6" />
    </Base>
  )
}

/** Bowl of soup with a spoon (feed). */
function FeedIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 15h24a12 9 0 0 1-24 0z" fill="#fff6e3" stroke={INK} strokeWidth="2" />
      <path d="M7 15h18" stroke="#f4c04e" strokeWidth="3" />
      <path d="M22 4l-5 10" stroke="#9aa3b2" strokeWidth="2.4" />
      <path d="M12 9c0-2 2-2 2-4M16 9c0-2 2-2 2-4" fill="none" stroke="#c8b8a8" strokeWidth="1.6" />
    </Base>
  )
}

/** Napkin (wipe mouth). */
function WipeIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 9l20-3-2 18-18 2z" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <path d="M9 13l13-2M9 18l12-1.5" stroke="#a9d6ff" strokeWidth="2" />
      <path d="M22 22l4 4" stroke="#ff9fb2" strokeWidth="2.4" />
    </Base>
  )
}

/** Heart in hands (comfort). */
function ComfortIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M16 13c-2-4-8-3-8 1 0 3 4 6 8 9 4-3 8-6 8-9 0-4-6-5-8-1z" fill="#ff9fb2" stroke={INK} strokeWidth="2" />
      <path d="M4 22c4 0 6 4 12 4s8-4 12-4" fill="none" stroke="#f4c04e" strokeWidth="2.6" />
    </Base>
  )
}

/** Wheelchair. */
function WheelIcon(props: Props) {
  return (
    <Base {...props}>
      <circle cx="13" cy="21" r="7" fill="none" stroke={INK} strokeWidth="2.2" />
      <circle cx="24" cy="26" r="2.5" fill={INK} />
      <path d="M10 6v10h10l4 10" fill="none" stroke="#4f86d9" strokeWidth="2.6" />
      <circle cx="10" cy="4.5" r="2" fill="#4f86d9" />
    </Base>
  )
}

function DoorIcon(props: Props) {
  return (
    <Base {...props}>
      <rect x="8" y="4" width="16" height="25" rx="2" fill="#c97b4a" stroke={INK} strokeWidth="2" />
      <circle cx="20" cy="17" r="1.5" fill="#f4c04e" />
      <path d="M4 29h24" stroke={INK} strokeWidth="2" />
    </Base>
  )
}

function BookIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 7c4-2 8-2 12 1 4-3 8-3 12-1v19c-4-2-8-2-12 1-4-3-8-3-12-1z" fill="#fff6e3" stroke={INK} strokeWidth="2" />
      <path d="M16 8v19" stroke={INK} strokeWidth="2" />
      <path d="M7 12h6M7 16h6M19 12h6" stroke="#2f8c7f" strokeWidth="1.8" />
    </Base>
  )
}

function PassportIcon(props: Props) {
  return (
    <Base {...props}>
      <rect x="7" y="4" width="18" height="24" rx="2.5" fill="#2f8c7f" stroke={INK} strokeWidth="2" />
      <circle cx="16" cy="14" r="4.5" fill="none" stroke="#f4c04e" strokeWidth="1.8" />
      <path d="M11.5 14h9M16 9.5c-2 3-2 6 0 9M16 9.5c2 3 2 6 0 9" stroke="#f4c04e" strokeWidth="1.2" fill="none" />
      <path d="M11 23h10" stroke="#f4c04e" strokeWidth="1.8" />
    </Base>
  )
}

function TicketIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M3 10h26v4a2.5 2.5 0 0 0 0 5v4H3v-4a2.5 2.5 0 0 0 0-5z" fill="#ffe08a" stroke={INK} strokeWidth="2" />
      <path d="M20 10v13" stroke={INK} strokeWidth="1.6" strokeDasharray="2 2" />
      <path d="M7 15h9M7 19h6" stroke="#d4473b" strokeWidth="1.8" />
    </Base>
  )
}

function TramIcon(props: Props) {
  return (
    <Base {...props}>
      <rect x="7" y="7" width="18" height="18" rx="4" fill="#f4c04e" stroke={INK} strokeWidth="2" />
      <rect x="10" y="10" width="12" height="6" rx="1" fill="#bfe6f2" />
      <circle cx="11.5" cy="20.5" r="1.5" fill={INK} />
      <circle cx="20.5" cy="20.5" r="1.5" fill={INK} />
      <path d="M12 4h8M16 4v3M9 25l-2 4M23 25l2 4" stroke={INK} strokeWidth="2" />
    </Base>
  )
}

function BottleIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M13 3h6v5c3 2 4 4 4 7v12a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V15c0-3 1-5 4-7z" fill="#7fc27a" stroke={INK} strokeWidth="2" />
      <rect x="11" y="16" width="10" height="6" rx="1" fill="#fff6e3" />
      <text x="16" y="21" textAnchor="middle" fontSize="5" fontWeight="900" fill="#2f8c7f">
        25¢
      </text>
    </Base>
  )
}

function HangerIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M16 9a3 3 0 1 1 3-3" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M16 9v2L4 20h24L16 11" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M8 20h16v7H8z" fill="#ff9fb2" stroke={INK} strokeWidth="2" />
    </Base>
  )
}

function LaptopIcon(props: Props) {
  return (
    <Base {...props}>
      <rect x="6" y="6" width="20" height="14" rx="2" fill="#a9d6ff" stroke={INK} strokeWidth="2" />
      <path d="M3 24h26l-2 3H5z" fill="#dfe6ee" stroke={INK} strokeWidth="2" />
      <path d="M10 11h8M10 15h12" stroke="#2f8c7f" strokeWidth="1.8" />
    </Base>
  )
}

function NumberIcon(props: Props) {
  return (
    <Base {...props}>
      <path d="M8 4h16v24l-3-2-2 2-3-2-3 2-2-2-3 2z" fill="#fff6e3" stroke={INK} strokeWidth="2" />
      <text x="16" y="18" textAnchor="middle" fontSize="8" fontWeight="900" fill="#d4473b">
        A-347
      </text>
    </Base>
  )
}

const ICONS: Record<ActionIconName, (props: Props) => JSX.Element> = {
  feed: FeedIcon,
  wipe: WipeIcon,
  comfort: ComfortIcon,
  wheel: WheelIcon,
  door: DoorIcon,
  book: BookIcon,
  passport: PassportIcon,
  ticket: TicketIcon,
  tram: TramIcon,
  bottle: BottleIcon,
  hanger: HangerIcon,
  laptop: LaptopIcon,
  number: NumberIcon,
  start: StartIcon,
  coffee: CoffeeIcon,
  milk: MilkIcon,
  ice: IceIcon,
  salt: SaltIcon,
  talk: TalkIcon,
  shop: ShopIcon,
  sleep: SleepIcon,
  save: SaveIcon,
}

export function ActionIcon({ name, ...props }: Props & { name: ActionIconName }) {
  const Icon = ICONS[name]
  return <Icon {...props} />
}
