import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FluidShader() {
  const outerSphereRef = useRef();
  const innerSphereRef = useRef();
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const bass = window.audioData ? window.audioData.bass : 0;

    // 1. Slow, elegant, continuous rotation
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y = time * 0.06;
      outerSphereRef.current.rotation.x = time * 0.02;
    }
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y = -time * 0.04;
    }

    // 2. Gentle mouse tilt using Lerp-based easing
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.35;
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;

    // 3. Audio reactivity: inner point cloud expands slightly on bass transients
    if (innerSphereRef.current) {
      const scaleVal = 0.95 + bass * 0.12;
      innerSphereRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }
  });

  return (
    // Position on the right side of the split screen layout (x = 1.3)
    <group ref={groupRef} position={[1.3, 0, 0]}>
      {/* Outer wireframe sphere: represents global coordinates and strategic grids */}
      <mesh ref={outerSphereRef}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.12} 
        />
      </mesh>

      {/* Inner points sphere: represents data nodes, populations, or information nets */}
      <points ref={innerSphereRef}>
        <sphereGeometry args={[1.1, 24, 24]} />
        <pointsMaterial 
          color="#ffffff" 
          size={0.02} 
          transparent 
          opacity={0.25} 
        />
      </points>

      {/* Stark, thin orbital ring */}
      <mesh rotation={[Math.PI / 2.2, 0.15, 0]}>
        <ringGeometry args={[1.8, 1.808, 64]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.08} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}
