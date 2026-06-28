import React, { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import HeroFloaters from './HeroFloaters';
import GalleryItems from './GalleryItems';
import FluidShader from './FluidShader';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

function CameraScroll() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Track mouse move for subtle parallax
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initial camera position
    camera.position.set(0, 0, 5);

    // Create GSAP ScrollTrigger Timeline
    // We bind it to the main scrollable container (.scroll-container)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2, // Smooth scrubbing
      }
    });

    // Animate camera position along the scroll timeline
    tl.to(camera.position, {
      z: 1.2, // Move in for Hero shapes to fly past
      y: 0,
      ease: 'power1.inOut',
    })
    .to(camera.position, {
      y: -15, // Slide down to Gallery
      z: 6.5,  // Pull back to frame the gallery wall
      ease: 'power2.inOut',
    })
    .to(camera.position, {
      y: -30, // Slide down to Split Screen fluid shader
      z: 5.0,  // Move closer for shader grid
      ease: 'power2.inOut',
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [camera]);

  // Frame loop for mouse parallax & scroll velocity rotation
  useFrame((state) => {
    const { x, y } = mouseRef.current;
    
    // Smoothly interpolate camera lookAt / tilt rotation
    // Subtle mouse tilt parallax (scaled by Scroll velocity or just standalone)
    const targetRotX = y * 0.15;
    const targetRotY = x * 0.2;

    // Read scroll velocity to add chromatic aberration or subtle camera tilt
    let velocity = 0;
    const trigger = ScrollTrigger.getById('main-scroll');
    if (trigger) {
      velocity = trigger.getVelocity() * 0.0001; // Scale velocity down
    }

    // Apply smooth rotations (inertia)
    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.08;
    camera.rotation.y += (targetRotY - camera.rotation.y) * 0.08;
    
    // Add subtle camera roll based on scroll velocity
    camera.rotation.z += (velocity - camera.rotation.z) * 0.1;
  });

  return null;
}

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <pointLight position={[-5, -15, -2]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[5, -30, 2]} intensity={0.8} color="#a78bfa" />

        {/* Camera Scroll Manager */}
        <CameraScroll />

        {/* Section 1: Hero Floaters (y = 0) */}
        <group position={[0, 0, 0]}>
          <HeroFloaters />
        </group>

        {/* Section 2: Floating Gallery (y = -15) */}
        <group position={[0, -15, 0]}>
          <GalleryItems />
        </group>

        {/* Section 3: Fluid Shader (y = -30) */}
        <group position={[0, -30, 0]}>
          <FluidShader />
        </group>
      </Canvas>
    </div>
  );
}
