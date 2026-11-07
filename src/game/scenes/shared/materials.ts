import { MeshBasicMaterial, MeshLambertMaterial, Vector3, type Material } from 'three'

/**
 * Shared materials. Soft Lambert shading gives the clay/toy look (plan §2)
 * and is cheap on mobile GPUs. Colors come from vertex colors (see Shapes).
 */

/**
 * See-through occluders: scene materials dither away fragments that sit on the line
 * between the camera and the player, or right in front of the lens. Poles, trees and
 * roofs therefore never hide the character. The CameraRig updates the target each frame.
 */
export const occlusion = {
  target: { value: new Vector3(0, -1000, 0) },
}

const OCCLUSION_FRAGMENT = /* glsl */ `
{
  vec3 occSeg = uOccTarget - cameraPosition;
  float occLen = length(occSeg);
  vec3 occDir = occSeg / max(occLen, 1e-4);
  vec3 occRel = vOccWorld - cameraPosition;
  float occAlong = dot(occRel, occDir);
  float occRadial = length(occRel - occDir * occAlong);
  // A soft tube around the sight line: wide near the camera, narrowing toward the
  // player and stopping just short of them, so things they hold or work on stay solid.
  float occT = occAlong / max(occLen, 1e-4);
  float occR = mix(1.15, 0.55, smoothstep(0.55, 1.0, occT));
  float occLine = (1.0 - smoothstep(occR * 0.65, occR, occRadial))
    * step(0.0, occAlong)
    * (1.0 - smoothstep(occLen - 1.5, occLen - 0.9, occAlong));
  // Anything almost touching the lens.
  float occNear = 1.0 - smoothstep(2.2, 3.6, length(occRel));
  // Fully clear at the core; the smoothstep edges give a dithered rim.
  float occFade = max(occLine, occNear);
  // 4x4 ordered dither: a screen-door fade without transparency sorting.
  ivec2 occP = ivec2(mod(floor(gl_FragCoord.xy), 4.0));
  const float occBayer[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  if (occFade > (occBayer[occP.x + occP.y * 4] + 0.5) / 16.0) discard;
}
`

function occlusionFade(shader: { uniforms: Record<string, { value: unknown }>; vertexShader: string; fragmentShader: string }) {
  shader.uniforms.uOccTarget = occlusion.target
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vOccWorld;')
    .replace(
      '#include <project_vertex>',
      '#include <project_vertex>\nvOccWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
    )
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform vec3 uOccTarget;\nvarying vec3 vOccWorld;')
    .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${OCCLUSION_FRAGMENT}`)
}

/** Opt a material into the see-through-occluder fade. */
export function withOcclusionFade<T extends Material>(material: T): T {
  material.onBeforeCompile = occlusionFade
  return material
}

/** Default for merged scene props and buildings. */
export const vertexColorMaterial = withOcclusionFade(new MeshLambertMaterial({ vertexColors: true }))

/** For ground-level geometry (roads, markings) that must never fade. */
export const groundMaterial = new MeshLambertMaterial({ vertexColors: true })

/** Never faded: characters and gameplay-critical props (e.g. the drink being made). */
export const solidMaterial = new MeshLambertMaterial({ vertexColors: true })

/** See-through glass (drawn after opaque objects, so what's inside stays visible). */
export const glassMaterial = new MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.38, depthWrite: false })

/** Writes nothing to the screen but still casts shadows — for cut-away roofs. */
export const shadowOnlyMaterial = new MeshBasicMaterial({ colorWrite: false, depthWrite: false })

/** Always drawn on top (markers floating over NPCs must never hide behind a parasol). */
export const overlayMaterial = new MeshBasicMaterial({ vertexColors: true, depthTest: false, depthWrite: false, transparent: true })

/** Unlit vertex colors — for things that "glow", like string-light bulbs. */
export const glowMaterial = withOcclusionFade(new MeshBasicMaterial({ vertexColors: true }))

const lambertCache = new Map<string, MeshLambertMaterial>()

/** Cached plain-color Lambert material (not faded; used for large ground planes). */
export function lambert(color: string): MeshLambertMaterial {
  let material = lambertCache.get(color)
  if (!material) {
    material = new MeshLambertMaterial({ color })
    lambertCache.set(color, material)
  }
  return material
}
