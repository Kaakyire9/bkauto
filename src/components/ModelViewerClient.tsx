"use client"
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any
    }
  }
}

type Props = {
  src?: string
  alt?: string
  viewerRef?: React.Ref<ModelViewerHandle>
}

export type ModelViewerHandle = {
  setMaterialColor: (materialName: string | null, hex: string) => Promise<boolean>
}

const ModelViewerClient = forwardRef<ModelViewerHandle, Props>(function ModelViewerClient({ src, alt = '3D preview', viewerRef }, ref) {
  const loaded = useRef(false)
  const defaultSrc = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
  const [effectiveSrc, setEffectiveSrc] = useState<string>('')
  const [ready, setReady] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const mvRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Prefer dynamic import of the installed package (ESM) so bundler handles module loading
    if (!loaded.current) {
      const load = async () => {
        try {
          // If model-viewer already defined, skip
          if ((window as any).customElements && (window as any).customElements.get && (window as any).customElements.get('model-viewer')) {
            loaded.current = true
            return
          }
          // dynamic import from installed package (works with bundlers)
          await import('@google/model-viewer')
          loaded.current = true
        } catch (e) {
          // Fallback: try loading UMD from CDN as module script
          try {
            const id = 'model-viewer-script'
            if (!document.getElementById(id)) {
              const s = document.createElement('script')
              s.id = id
              s.type = 'module'
              s.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
              s.async = true
              s.defer = true
              document.head.appendChild(s)
            }
            loaded.current = true
          } catch (err) {
            // give up silently; model-viewer won't be available
            console.warn('Failed to load model-viewer:', err)
          }
        }
      }
      void load()
    }

    // prefers-reduced-motion
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mq.matches)
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else mq.addListener(handler)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function check() {
      const candidate = src ?? defaultSrc
      // If candidate is a relative path, make a HEAD request to confirm presence
      try {
        let resolved = candidate
        if (candidate.startsWith('/')) {
          const res = await fetch(candidate, { method: 'HEAD' })
          resolved = res.ok ? candidate : defaultSrc
        }
        if (!cancelled) {
          // only update when different to avoid unnecessary updates
          setEffectiveSrc((prev) => (prev === resolved ? prev : resolved))
        }
      } catch (e) {
        if (!cancelled) setEffectiveSrc(defaultSrc)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    check()
    return () => { cancelled = true }
  }, [src])

  // Debounce / batching support: coalesce rapid color change requests so
  // we don't schedule multiple material updates inside the same Lit update
  // cycle. Rapid swatch clicks will resolve once the last requested color
  // has been applied.
  const debounceMs = 120
  const pendingRequestRef = useRef<{ materialName: string | null; hex: string } | null>(null)
  const pendingResolversRef = useRef<Array<(v: boolean) => void>>([])
  const pendingTimerRef = useRef<number | null>(null)

  async function applyColor(materialName: string | null, hex: string): Promise<boolean> {
    try {
      const mv = mvRef.current
      if (!mv) return false

      // wait until model is loaded
      if (!mv.model) {
        await new Promise((res) => mv.addEventListener('load', res, { once: true }))
      }

      // Wait for Lit's update cycle to finish (if present) to avoid nested updates
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (mv.updateComplete && typeof mv.updateComplete.then === 'function') {
          // @ts-ignore
          await mv.updateComplete
        }
      } catch (e) {
        // ignore
      }

      // Defer to next frame — reduces chance of mutating during an element update
      await new Promise((res) => requestAnimationFrame(res))

      const model = mv.model
      const scene = (model && (model.scene || model.gltfModel?.scene)) || null
      if (!scene) return false

      let changed = false
      scene.traverse((node: any) => {
        if (!node.isMesh || !node.material) return
        const mats = Array.isArray(node.material) ? node.material : [node.material]
        mats.forEach((mat: any) => {
          const nameMatches = !materialName || (mat.name && mat.name.toLowerCase().includes(materialName.toLowerCase()))
          if (nameMatches) {
            if (mat.color && typeof mat.color.set === 'function') {
              try {
                mat.color.set(hex)
                mat.needsUpdate = true
                changed = true
              } catch (e) {
                // ignore failures
              }
            } else if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor) {
              try {
                const bigint = parseInt(hex.replace('#', ''), 16)
                const r = ((bigint >> 16) & 255) / 255
                const g = ((bigint >> 8) & 255) / 255
                const b = (bigint & 255) / 255
                mat.pbrMetallicRoughness.baseColorFactor[0] = r
                mat.pbrMetallicRoughness.baseColorFactor[1] = g
                mat.pbrMetallicRoughness.baseColorFactor[2] = b
                mat.pbrMetallicRoughness.baseColorFactor[3] = 1
                changed = true
              } catch (e) {
                // ignore
              }
            }
          }
        })
      })

      return changed
    } catch (e) {
      console.warn('applyColor failed', e)
      return false
    }
  }

  const handle: ModelViewerHandle = {
    setMaterialColor: (materialName: string | null, hex: string) => {
      // record the latest requested color (last-wins)
      pendingRequestRef.current = { materialName, hex }

      // return a promise that resolves when the scheduled apply runs
      const p = new Promise<boolean>((resolve) => {
        pendingResolversRef.current.push(resolve)

        // reset timer
        if (pendingTimerRef.current) {
          try { window.clearTimeout(pendingTimerRef.current as any) } catch {}
          pendingTimerRef.current = null
        }

        pendingTimerRef.current = window.setTimeout(async () => {
          const req = pendingRequestRef.current
          pendingRequestRef.current = null
          pendingTimerRef.current = null

          let result = false
          try {
            result = await applyColor(req?.materialName ?? null, req?.hex ?? '')
          } catch (e) {
            console.warn('batched applyColor failed', e)
            result = false
          }

          const resolvers = pendingResolversRef.current.splice(0)
          resolvers.forEach((r) => {
            try { r(result) } catch {}
          })
        }, debounceMs) as unknown as number
      })

      return p
    }
  }

  useImperativeHandle(ref, () => handle)

  // also assign to viewerRef prop if provided (dynamic loader wrapper can't accept ref)
  useEffect(() => {
    if (!viewerRef) return

    // If it's a callback ref, call it with the handle.
    if (typeof viewerRef === 'function') {
      viewerRef(handle)
      return () => { viewerRef(null) }
    }

    // Otherwise treat it as an object ref and attempt to set .current (cast to mutable).
    const mutableRef = viewerRef as React.MutableRefObject<ModelViewerHandle | null>
    try {
      mutableRef.current = handle
      return () => { mutableRef.current = null }
    } catch {
      // If assignment fails, do nothing.
      return
    }
  }, [viewerRef])

  if (!ready) {
    return (
      <div className="h-56 bg-[#041123]/20 rounded-xl flex items-center justify-center text-sm text-[#C6CDD1]/60">Loading 3D preview…</div>
    )
  }

  return (
    <div className="w-full">
      <model-viewer
        ref={mvRef}
        src={effectiveSrc || defaultSrc}
        alt={alt}
        camera-controls
        auto-rotate={!prefersReducedMotion}
        exposure="1"
        shadow-intensity="1"
        ar
        ar-modes="webxr scene-viewer quick-look"
        style={{ width: '100%', height: '220px', borderRadius: 12 }}
        className="rounded-xl overflow-hidden bg-[#041123]/20"
      >
        <div slot="poster" className="w-full h-full flex items-center justify-center text-sm text-[#C6CDD1]/60">Loading 3D preview…</div>
      </model-viewer>
    </div>
  )
})

export default ModelViewerClient
