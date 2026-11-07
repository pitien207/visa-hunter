import { useEffect, useMemo } from 'react'
import { MeshLambertMaterial } from 'three'
import type { Vec3 } from '../../../data/config'
import { withOcclusionFade } from './materials'
import { makeSignTexture, SIGN_FONT_FAMILY, type SignOptions } from './textures'

/** A flat painted shop sign. `width` is in metres; height follows the sign's aspect ratio. */
export function SignBoard({
  options,
  width,
  position,
  rotation = [0, 0, 0],
}: {
  options: SignOptions
  width: number
  position: Vec3
  rotation?: Vec3
}) {
  const { sign, material } = useMemo(() => {
    const sign = makeSignTexture(options)
    return { sign, material: withOcclusionFade(new MeshLambertMaterial({ map: sign.texture })) }
    // Options are module constants in practice; rebuild only if the text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.title, options.subtitle])

  useEffect(() => {
    let cancelled = false
    document.fonts?.load(`800 118px ${SIGN_FONT_FAMILY}`).then(() => {
      if (!cancelled) sign.redraw()
    })
    return () => {
      cancelled = true
      material.map?.dispose()
      material.dispose()
    }
  }, [sign, material])

  const aspect = options.aspect ?? 4
  return (
    <mesh position={position} rotation={rotation} material={material}>
      <planeGeometry args={[width, width / aspect]} />
    </mesh>
  )
}
