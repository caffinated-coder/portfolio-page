import React, { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Centerpiece from './Centerpiece';

// Simple Camera Scroll Handler: Keeps camera centered, adds dynamic zoom and tilt on scroll
function CameraScroll() {
  const { camera } = useThree();

  useEffect(() => {
    // Register scroll controller linked to GSAP ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'main-scroll',
        trigger: '.portfolio-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // Gently push camera back (zoom out) on scroll to make space for content
    tl.to(camera.position, {
      z: 5.8,
      ease: 'none'
    });

    return () => {
      // Clean up trigger on unmount
      const trigger = ScrollTrigger.getById('main-scroll');
      if (trigger) trigger.kill();
    };
  }, [camera]);

  return null;
}

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 5] }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Monochromatic lights */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 10, 5]} intensity={0.7} color="#ffffff" />
        <pointLight position={[-5, 5, -2]} intensity={0.3} color="#ffffff" />
        <pointLight position={[5, -5, 2]} intensity={0.4} color="#ffffff" />

        {/* Camera Scroll Manager */}
        <CameraScroll />

        {/* Unified 3D Centerpiece */}
        <Centerpiece />
      </Canvas>
    </div>
  );
}
