/**
 * Hồ Gươm at sunrise, drawn in SVG for the title and loading screens: Old Quarter
 * rooftops, the lake, Tháp Rùa on its islet, the red Thê Húc bridge and weeping willows.
 * Original artwork.
 */
export function HanoiScenery({ className = '' }: { className?: string }) {
  const roofs = [
    [0, 150, 46, 30],
    [40, 140, 40, 40],
    [76, 152, 36, 28],
    [300, 146, 40, 34],
    [336, 136, 36, 44],
    [368, 150, 40, 30],
  ]
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hn-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9d6cf" />
          <stop offset="1" stopColor="#7fbab1" />
        </linearGradient>
      </defs>
      {/* Sun and a couple of soft clouds */}
      <circle cx="292" cy="62" r="26" fill="#ffe08a" opacity="0.9" />
      <path d="M40 70c10-12 30-12 40 0 10-6 24-2 26 8H34c0-4 2-7 6-8z" fill="#fffaf2" opacity="0.8" />
      <path d="M318 98c8-9 22-9 30 0 8-4 18-1 20 6h-55c0-3 2-5 5-6z" fill="#fffaf2" opacity="0.7" />

      {/* Old Quarter rooftops on the far shore */}
      {roofs.map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h + 20} fill={i % 2 ? '#f2c46d' : '#f4dfae'} />
          <path d={`M${x - 3} ${y} L${x + w / 2} ${y - 12} L${x + w + 3} ${y} Z`} fill="#c8653d" />
          <rect x={x + w * 0.3} y={y + 8} width={w * 0.4} height={10} fill="#3f7d5c" />
        </g>
      ))}

      {/* The lake */}
      <rect x="0" y="172" width="400" height="88" fill="url(#hn-lake)" />
      {[190, 206, 224, 242].map((y, i) => (
        <path key={y} d={`M${20 + i * 30} ${y}h${60 - i * 6}M${210 + i * 20} ${y + 6}h${50 - i * 4}`} stroke="#d4ece7" strokeWidth="2" strokeLinecap="round" />
      ))}

      {/* Tháp Rùa on its islet */}
      <ellipse cx="118" cy="190" rx="40" ry="8" fill="#8fbf6a" />
      <g fill="#e2d4b5" stroke="#b8a888" strokeWidth="1">
        <rect x="104" y="160" width="28" height="26" />
        <rect x="108" y="142" width="20" height="18" />
        <rect x="112" y="128" width="12" height="14" />
      </g>
      <path d="M110 128l8-8 8 8z" fill="#7d7466" />
      <path d="M110 186v-10a4 4 0 0 1 8 0v10M120 186v-10a4 4 0 0 1 8 0v10M114 160v-8a4 4 0 0 1 8 0v8" fill="#6f6656" />
      <ellipse cx="118" cy="196" rx="26" ry="3" fill="#6fa69d" opacity="0.6" />

      {/* Thê Húc bridge to Đền Ngọc Sơn */}
      <path d="M232 214 Q300 168 380 188" fill="none" stroke="#c8322b" strokeWidth="7" strokeLinecap="round" />
      <path d="M232 204 Q300 158 380 178" fill="none" stroke="#e04b3c" strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: 11 }, (_, i) => {
        const t = i / 10
        const x = (1 - t) * (1 - t) * 232 + 2 * (1 - t) * t * 300 + t * t * 380
        const y = (1 - t) * (1 - t) * 214 + 2 * (1 - t) * t * 168 + t * t * 188
        return <rect key={i} x={x - 1.5} y={y - 10} width="3" height="10" fill="#c8322b" />
      })}
      <rect x="362" y="150" width="34" height="8" fill="#f2c46d" />
      <path d="M356 150l23-14 23 14z" fill="#5b4a3e" />
      <rect x="364" y="158" width="4" height="26" fill="#c8322b" />
      <rect x="390" y="158" width="4" height="26" fill="#c8322b" />

      {/* Willows framing the view */}
      {[
        [18, 168, 1],
        [210, 176, 0.8],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M0 80 C2 50 -2 30 6 0" stroke="#8a6a55" strokeWidth="5" fill="none" />
          <ellipse cx="6" cy="-6" rx="30" ry="20" fill="#a5d36b" />
          {[-26, -14, -2, 10, 22, 32].map((dx) => (
            <path key={dx} d={`M${dx} -4 q3 30 ${dx > 6 ? 4 : -4} 52`} stroke="#93c75e" strokeWidth="6" strokeLinecap="round" fill="none" />
          ))}
        </g>
      ))}
    </svg>
  )
}
