import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

type Props = { floors: number }

export default function BuildingViewer({ floors }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setReady(false)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(element.clientWidth, element.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    element.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#eef3f7')
    const camera = new THREE.PerspectiveCamera(42, element.clientWidth / element.clientHeight, 0.1, 100)
    camera.position.set(10, 8, 12)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, floors * 0.65, 0)

    scene.add(new THREE.HemisphereLight('#ffffff', '#8b9bab', 2.1))
    const sun = new THREE.DirectionalLight('#fff4df', 3)
    sun.position.set(8, 14, 10)
    sun.castShadow = true
    scene.add(sun)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 22),
      new THREE.MeshStandardMaterial({ color: '#dce4e9', roughness: 0.92 }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.08
    floor.receiveShadow = true
    scene.add(floor)
    const grid = new THREE.GridHelper(22, 22, '#aebdc8', '#d0d9df')
    grid.position.y = -0.06
    scene.add(grid)

    const building = new THREE.Group()
    const floorHeight = 1.18
    const slabMaterial = new THREE.MeshStandardMaterial({ color: '#e7edf1', roughness: 0.78 })
    const columnMaterial = new THREE.MeshStandardMaterial({ color: '#aebdc7', roughness: 0.7 })
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#5b91b5', metalness: 0.22, roughness: 0.22, transparent: true, opacity: 0.78,
    })
    const core = new THREE.Mesh(new THREE.BoxGeometry(3.9, floors * floorHeight, 3.1), slabMaterial)
    core.position.y = floors * floorHeight / 2
    core.castShadow = true
    core.receiveShadow = true
    building.add(core)

    for (let level = 0; level < floors; level += 1) {
      const y = level * floorHeight + floorHeight / 2
      const slab = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.09, 3.65), slabMaterial)
      slab.position.y = y
      slab.castShadow = true
      slab.receiveShadow = true
      building.add(slab)

      for (const x of [-2.02, 2.02]) {
        for (const z of [-1.48, 1.48]) {
          const column = new THREE.Mesh(new THREE.BoxGeometry(0.13, floorHeight, 0.13), columnMaterial)
          column.position.set(x, y, z)
          column.castShadow = true
          building.add(column)
        }
      }
      const window = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.74, 0.045), glassMaterial)
      window.position.set(0, y + 0.02, 1.57)
      building.add(window)
      const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.74, 2.85), glassMaterial)
      sideWindow.position.set(2.0, y + 0.02, 0)
      building.add(sideWindow)
    }

    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.16, 3.9), new THREE.MeshStandardMaterial({ color: '#344d62' }))
    roof.position.y = floors * floorHeight + 0.05
    roof.castShadow = true
    building.add(roof)
    scene.add(building)

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(animate)
    setReady(true)

    const resize = () => {
      if (!host.current) return
      const width = host.current.clientWidth
      const height = host.current.clientHeight
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(element)

    return () => {
      observer.disconnect()
      renderer.setAnimationLoop(null)
      controls.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [floors])

  return (
    <div className="viewer-wrap">
      <div className="viewer-badge"><span className="status-dot" /> MODEL 3D · PRATINJAU</div>
      <div className="viewer-canvas" ref={host} aria-label="Pratinjau gedung tiga dimensi" />
      {!ready && <div className="viewer-fallback">Pratinjau 3D memerlukan browser dengan dukungan WebGL.</div>}
      <div className="viewer-help">Seret untuk memutar · Gulir untuk zoom · Klik kanan untuk menggeser</div>
    </div>
  )
}
