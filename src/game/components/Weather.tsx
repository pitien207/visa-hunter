import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, ShaderMaterial, Vector3 } from 'three'
import { CONFIG } from '../../data/config'
import { useSettings } from '../../store/settingsStore'
import { playerState } from '../systems/playerState'
import { weatherState } from '../systems/weather'

/**
 * Weather particles (M9): rain streaks and drifting phượng / bằng lăng petals.
 * All motion happens in the vertex shader; the CPU only updates a few uniforms per frame.
 * Particles live at fixed world positions inside a box that wraps around the view,
 * so walking through them looks natural.
 */

const RAIN_BOX = new Vector3(34, 14, 34)
const PETAL_BOX = new Vector3(26, 7, 26)

const WRAP = /* glsl */ `
  vec3 wrapAround(vec3 seed, vec3 box, vec3 center) {
    vec3 hb = box * 0.5;
    vec3 p;
    p.xz = center.xz + mod(seed.xz * box.xz - center.xz + hb.xz, box.xz) - hb.xz;
    p.y = seed.y * box.y;
    return p;
  }
`

const rainVertex = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uCenter;
  uniform vec3 uBox;
  attribute vec3 aSeed;
  attribute float aEnd;
  varying float vAlpha;
  ${WRAP}
  void main() {
    vec3 p = wrapAround(aSeed, uBox, uCenter);
    float speed = 15.0 + aSeed.x * 7.0;
    p.y = mod(p.y - uTime * speed, uBox.y);
    vec3 dir = normalize(vec3(0.14, -1.0, 0.06));
    p += dir * aEnd * (0.45 + aSeed.z * 0.35);
    vAlpha = uOpacity * (1.0 - aEnd * 0.8) * smoothstep(0.0, 1.2, p.y);
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`

const rainFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(0.9, 0.94, 1.0, vAlpha * 0.75);
  }
`

const petalVertex = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uScale;
  uniform vec3 uCenter;
  uniform vec3 uBox;
  attribute vec3 aSeed;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vSpin;
  varying float vAlpha;
  ${WRAP}
  void main() {
    vec3 p = wrapAround(aSeed, uBox, uCenter);
    float speed = 0.45 + aSeed.x * 0.35;
    p.y = mod(p.y - uTime * speed, uBox.y) + 0.05;
    p.x += sin(uTime * 0.8 + aSeed.z * 31.0) * 0.7;
    p.z += cos(uTime * 0.6 + aSeed.x * 23.0) * 0.7;
    vec4 mv = viewMatrix * vec4(p, 1.0);
    gl_PointSize = uScale * (0.7 + aSeed.z * 0.6) / max(1.0, -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vSpin = uTime * (1.2 + aSeed.z * 2.0) + aSeed.x * 6.283;
    // fade in at the top, out on the ground
    vAlpha = uOpacity * smoothstep(0.0, 0.4, p.y) * (1.0 - smoothstep(uBox.y - 1.0, uBox.y, p.y));
  }
`

const petalFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vSpin;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float c = cos(vSpin), s = sin(vSpin);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
    // a petal: squashed ellipse, slightly narrower at one end
    float w = 0.5 + uv.y * 0.35;
    float d = length(vec2(uv.x * 2.6 / w, uv.y * 2.1));
    if (d > 1.0 || vAlpha < 0.02) discard;
    vec3 col = mix(vColor * 0.82, vColor, 0.5 + uv.y);
    gl_FragColor = vec4(col, vAlpha);
  }
`

// Red phượng, purple bằng lăng and creamy-white hoa sữa — Hà Nội's street trees
const PETAL_COLORS = ['#ff6b5e', '#fff6dc', '#b48fe0', '#f25f6b', '#fffaf0', '#c9a4f0'].map((c) => new Color(c))

function seeds(count: number, perItem: number) {
  const seed = new Float32Array(count * perItem * 3)
  for (let i = 0; i < count; i++) {
    const x = Math.random()
    const y = Math.random()
    const z = Math.random()
    for (let k = 0; k < perItem; k++) seed.set([x, y, z], (i * perItem + k) * 3)
  }
  return seed
}

const _center = new Vector3()

/** The middle of the view: halfway between the player and the camera. */
function viewCenter(camera: { position: Vector3 }) {
  return _center.copy(playerState.position).lerp(camera.position, 0.45)
}

function Rain({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(count * 2 * 3), 3))
    g.setAttribute('aSeed', new BufferAttribute(seeds(count, 2), 3))
    const end = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) end[i * 2 + 1] = 1
    g.setAttribute('aEnd', new BufferAttribute(end, 1))
    return g
  }, [count])
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uCenter: { value: new Vector3() }, uBox: { value: RAIN_BOX } },
        vertexShader: rainVertex,
        fragmentShader: rainFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  const ref = useRef<{ visible: boolean } | null>(null)
  useFrame(({ camera, clock }) => {
    const r = weatherState.rain
    if (ref.current) ref.current.visible = r > 0.01
    if (r <= 0.01) return
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uOpacity.value = r
    material.uniforms.uCenter.value.copy(viewCenter(camera))
  })
  return <lineSegments ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />
}

function Petals({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const geometry = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
    g.setAttribute('aSeed', new BufferAttribute(seeds(count, 1), 3))
    const color = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const c = PETAL_COLORS[i % PETAL_COLORS.length]
      color.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('aColor', new BufferAttribute(color, 3))
    return g
  }, [count])
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uScale: { value: 160 },
          uCenter: { value: new Vector3() },
          uBox: { value: PETAL_BOX },
        },
        vertexShader: petalVertex,
        fragmentShader: petalFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  const ref = useRef<{ visible: boolean } | null>(null)
  useFrame(({ camera, clock, size }) => {
    const v = weatherState.petals
    if (ref.current) ref.current.visible = v > 0.01
    if (v <= 0.01) return
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uOpacity.value = v
    // Point size in pixels, scaled with the canvas height so petals look the same on any screen.
    material.uniforms.uScale.value = size.height * dpr * 0.2
    material.uniforms.uCenter.value.copy(viewCenter(camera))
  })
  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={4} />
}

export function Weather() {
  const quality = useSettings((s) => s.quality)
  const counts = CONFIG.weather.particles[quality]
  return (
    <>
      <Rain key={`r${counts.rain}`} count={counts.rain} />
      <Petals key={`p${counts.petals}`} count={counts.petals} />
    </>
  )
}
