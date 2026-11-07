import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

/** Procedural canvas textures: no image downloads, crisp on any DPR. */

function newCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas not supported')
  return { canvas, ctx }
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Square paving tiles with soft grout lines, meant to be repeated. */
export function makeTileTexture(base: string, grout: string, repeatX: number, repeatY: number) {
  const size = 128
  const { canvas, ctx } = newCanvas(size, size)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = grout
  ctx.lineWidth = 6
  ctx.strokeRect(0, 0, size, size)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(size / 2, 0)
  ctx.lineTo(size / 2, size)
  ctx.moveTo(0, size / 2)
  ctx.lineTo(size, size / 2)
  ctx.stroke()
  const texture = toTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  return texture
}

/** Vertical stripes (used for the café awning). */
export function makeStripeTexture(colors: string[], stripes: number) {
  const { canvas, ctx } = newCanvas(stripes * 16, 16)
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = colors[i % colors.length]
    ctx.fillRect(i * 16, 0, 16, 16)
  }
  return toTexture(canvas)
}

export interface SignOptions {
  title: string
  subtitle?: string
  background: string
  border: string
  color: string
  accent: string
  /** Width/height ratio of the board (default 4). */
  aspect?: number
}

export const SIGN_FONT_FAMILY = "'Baloo 2'"
const SIGN_FONT = "'Baloo 2', 'Nunito', ui-rounded, 'Segoe UI', system-ui, sans-serif"

/**
 * Draws a shop sign. Returns the texture plus a `redraw` to call once web fonts
 * finish loading (the first draw may use a fallback font).
 */
export function makeSignTexture(opts: SignOptions) {
  const { canvas, ctx } = newCanvas(Math.round(256 * (opts.aspect ?? 4)), 256)
  const texture = toTexture(canvas)

  const redraw = () => {
    const { width: w, height: h } = canvas
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = opts.border
    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, 56)
    ctx.fill()
    ctx.fillStyle = opts.background
    ctx.beginPath()
    ctx.roundRect(14, 14, w - 28, h - 28, 44)
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = opts.color
    ctx.font = `800 ${opts.subtitle ? 118 : 150}px ${SIGN_FONT}`
    ctx.fillText(opts.title, w / 2, opts.subtitle ? h * 0.44 : h * 0.54)
    if (opts.subtitle) {
      ctx.fillStyle = opts.accent
      ctx.font = `700 48px ${SIGN_FONT}`
      ctx.fillText(opts.subtitle, w / 2, h * 0.8)
    }
    texture.needsUpdate = true
  }

  redraw()
  return { texture, redraw }
}
