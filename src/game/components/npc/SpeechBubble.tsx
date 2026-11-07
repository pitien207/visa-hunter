import { Html } from '@react-three/drei'
import { useLocalize } from '../../../i18n/localized'
import { useBubbles } from '../../../store/bubbleStore'

/** A comic speech bubble above a speaker's head (DOM, so Vietnamese text renders crisply). */
export function SpeechBubble({ id, y = 2.05 }: { id: string; y?: number }) {
  const bubble = useBubbles((s) => s.bubbles[id])
  const localize = useLocalize()
  if (!bubble) return null
  return (
    <Html position={[0, y, 0]} center distanceFactor={9} zIndexRange={[4, 0]} style={{ pointerEvents: 'none' }}>
      <div
        key={bubble.key}
        className="animate-bubble relative w-max max-w-[12rem] rounded-2xl border-2 border-[#f1dcb6] bg-white px-3 py-1.5 text-center text-[13px] leading-snug font-extrabold text-ink shadow-[0_3px_0_rgba(91,70,54,0.2)]"
      >
        {localize(bubble.text)}
        <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-[#f1dcb6] bg-white" />
      </div>
    </Html>
  )
}
