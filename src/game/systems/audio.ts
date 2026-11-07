import { useSettings } from '../../store/settingsStore'

/**
 * Procedural audio (plan §3 lists Howler.js; synthesising with WebAudio instead means
 * zero audio downloads and no licensing questions). Music: a small looping tune per
 * country. SFX: short synthesized blips. The AudioContext starts on the first tap/key
 * (browser autoplay rules).
 */

export type SfxName = 'click' | 'right' | 'wrong' | 'coin' | 'pickup' | 'success' | 'fail' | 'honk' | 'door' | 'stamp' | 'sip' | 'bell'
export type MusicTheme = 'vn' | 'de' | 'indoor' | null

let ctx: AudioContext | null = null
let master: GainNode
let musicBus: GainNode
let sfxBus: GainNode
let theme: MusicTheme = null
let step = 0
let nextTime = 0
let scheduler: number | undefined

const MUSIC_VOLUME = 0.16
const SFX_VOLUME = 0.5

function applyVolumes() {
  if (!ctx) return
  const { musicOn, sfxOn } = useSettings.getState()
  musicBus.gain.setTargetAtTime(musicOn ? MUSIC_VOLUME : 0, ctx.currentTime, 0.1)
  sfxBus.gain.setTargetAtTime(sfxOn ? SFX_VOLUME : 0, ctx.currentTime, 0.05)
}

function ensureContext() {
  if (ctx) return ctx
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  musicBus = ctx.createGain()
  sfxBus = ctx.createGain()
  musicBus.connect(master)
  sfxBus.connect(master)
  applyVolumes()
  return ctx
}

/** Call once at startup: unlocks audio on the first user gesture and follows settings. */
export function initAudio() {
  const unlock = () => {
    const c = ensureContext()
    if (c?.state === 'suspended') void c.resume()
    startScheduler()
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
  // Loaded after a tap on the title screen: audio may start right away.
  if (navigator.userActivation?.hasBeenActive) unlock()
  useSettings.subscribe(applyVolumes)
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) void ctx.suspend()
    else void ctx.resume()
  })
  // Small "click" on every button press.
  window.addEventListener(
    'click',
    (e) => {
      if ((e.target as HTMLElement | null)?.closest('button')) playSfx('click')
    },
    true,
  )
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, bus: AudioNode, slideTo?: number) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(g).connect(bus)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function noise(start: number, dur: number, gain: number, freq: number) {
  if (!ctx) return
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = freq
  const g = ctx.createGain()
  g.gain.value = gain
  src.connect(filter).connect(g).connect(sfxBus)
  src.start(start)
}

export function playSfx(name: SfxName) {
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime + 0.005
  const b = sfxBus
  switch (name) {
    case 'click':
      tone(1200, t, 0.04, 'sine', 0.12, b)
      break
    case 'right':
      tone(784, t, 0.12, 'triangle', 0.35, b)
      tone(1175, t + 0.08, 0.18, 'triangle', 0.35, b)
      break
    case 'wrong':
      tone(330, t, 0.22, 'square', 0.12, b, 220)
      break
    case 'coin':
      tone(988, t, 0.08, 'square', 0.12, b)
      tone(1319, t + 0.07, 0.25, 'square', 0.12, b)
      break
    case 'pickup':
      tone(880, t, 0.08, 'sine', 0.3, b, 1600)
      break
    case 'success':
      ;[523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.3, 'triangle', 0.3, b))
      break
    case 'fail':
      ;[523, 440, 349].forEach((f, i) => tone(f, t + i * 0.13, 0.3, 'triangle', 0.25, b))
      break
    case 'honk':
      tone(440, t, 0.14, 'square', 0.1, b)
      tone(554, t, 0.14, 'square', 0.08, b)
      tone(440, t + 0.2, 0.2, 'square', 0.1, b)
      tone(554, t + 0.2, 0.2, 'square', 0.08, b)
      break
    case 'door':
      noise(t, 0.25, 0.5, 600)
      tone(140, t, 0.2, 'sine', 0.3, b)
      break
    case 'bell':
      // School bell: "reng reng reng"
      for (let i = 0; i < 10; i++) tone(i % 2 ? 1568 : 1760, t + i * 0.055, 0.07, 'square', 0.12, b)
      for (let i = 0; i < 10; i++) tone(i % 2 ? 1568 : 1760, t + 0.75 + i * 0.055, 0.07, 'square', 0.12, b)
      break
    case 'stamp':
      tone(90, t, 0.25, 'sine', 0.6, b)
      noise(t, 0.08, 0.6, 2000)
      break
    case 'sip':
      noise(t, 0.35, 0.25, 900)
      break
  }
}

// --- Music -------------------------------------------------------------------

/** Pentatonic for Vietnam (a plucked, zither-like line), major + oom-pah for Germany. */
const SCALES: Record<Exclude<MusicTheme, null>, number[]> = {
  vn: [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3],
  de: [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9, 523.3],
  indoor: [220, 246.9, 261.6, 329.6, 349.2, 440, 493.9, 523.3],
}
// Scale degrees per eighth note (-1 = rest).
const MELODY: Record<Exclude<MusicTheme, null>, number[]> = {
  vn: [4, -1, 5, 4, 2, -1, 3, -1, 4, 3, 2, -1, 0, -1, 1, 2, 4, -1, 5, 7, 6, -1, 5, 4, 2, -1, 3, 2, 0, -1, -1, -1],
  de: [0, 2, 4, 2, 7, -1, 4, -1, 5, 4, 3, 1, 2, -1, -1, -1, 4, 5, 6, 4, 7, -1, 5, -1, 3, 2, 1, 6, 0, -1, -1, -1],
  indoor: [2, -1, 4, -1, 5, -1, 4, 2, 1, -1, 2, -1, 0, -1, -1, -1, 2, -1, 4, -1, 6, 5, 4, -1, 3, -1, 1, -1, 2, -1, -1, -1],
}
const BASS: Record<Exclude<MusicTheme, null>, number[]> = {
  vn: [0, 3, 4, 0],
  de: [0, 4, 3, 4],
  indoor: [0, 2, 3, 0],
}
const STEP_SEC = 60 / 92 / 2

function scheduleStep(time: number) {
  if (!theme) return
  const scale = SCALES[theme]
  const deg = MELODY[theme][step % 32]
  if (deg >= 0) {
    const f = scale[deg]
    if (theme === 'vn') {
      tone(f, time, 0.45, 'triangle', 0.22, musicBus, f * 0.985) // a gentle bend like đàn tranh
    } else {
      tone(f * 2, time, 0.35, 'sine', 0.18, musicBus)
      tone(f * 4, time, 0.12, 'sine', 0.04, musicBus)
    }
  }
  if (step % 4 === 0) {
    const root = scale[BASS[theme][Math.floor(step / 8) % 4]] / 2
    tone(root, time, 0.5, 'sine', 0.22, musicBus)
    if (theme === 'de') tone(root * 1.5, time + STEP_SEC * 2, 0.3, 'sine', 0.12, musicBus)
  }
  step++
}

function startScheduler() {
  if (scheduler !== undefined || !ctx) return
  nextTime = ctx.currentTime + 0.1
  scheduler = window.setInterval(() => {
    if (!ctx || ctx.state !== 'running') return
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(nextTime)
      nextTime += STEP_SEC
    }
  }, 30)
}

// --- Rain ambience: looping filtered noise on the SFX bus --------------------------
let rainGain: GainNode | null = null
let rainLevel = 0

function ensureRain() {
  if (rainGain || !ctx) return rainGain
  const seconds = 2
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1400
  band.Q.value = 0.6
  rainGain = ctx.createGain()
  rainGain.gain.value = 0
  src.connect(band).connect(rainGain).connect(sfxBus)
  src.start()
  return rainGain
}

/** Rain loudness 0–1 (called every frame; only touches the audio graph on real changes). */
export function setRainAmbience(level: number) {
  if (Math.abs(level - rainLevel) < 0.02 && !(level === 0 && rainLevel > 0)) return
  rainLevel = level
  if (!ctx || (level <= 0 && !rainGain)) return
  const g = ensureRain()
  g?.gain.setTargetAtTime(level * 0.09, ctx.currentTime, 0.4)
}

/** Switch the background tune (null = silence). */
export function setMusicTheme(next: MusicTheme) {
  if (next === theme) return
  theme = next
  step = 0
}
