"use client"

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Create star particles
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
    })

    const starPositions = []
    const starColors = []
    const starSizes = []

    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = -Math.random() * 2000
      starPositions.push(x, y, z)

      const r = Math.random()
      const g = Math.random()
      const b = Math.random()
      starColors.push(r, g, b)

      const size = Math.random() * 2 + 0.5
      starSizes.push(size)
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3))
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1))

    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    camera.position.z = 5

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      stars.rotation.y += 0.0002
      stars.rotation.x += 0.0001

      // Update star sizes for twinkling effect
      const sizes = stars.geometry.attributes.size.array
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = Math.random() * 2 + 0.5
      }
      stars.geometry.attributes.size.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="w-full h-screen bg-black">
      <canvas ref={canvasRef} className="absolute top-0 left-0 h-full" />
    </div>
  )
}