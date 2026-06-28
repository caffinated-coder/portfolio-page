import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function HeroFloaters() {
  const groupRef = useRef();

  // Create an array of 25 abstract shapes with randomized positions, geometry types, and material settings
  const shapes = useMemo(() => {
    const arr = [];
    const geometries = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.TorusGeometry(0.3, 0.1, 8, 24),
      new THREE.ConeGeometry(0.3, 0.6, 4),
      new THREE.DodecahedronGeometry(0.4),
      new THREE.IcosahedronGeometry(0.35, 1),
    ];

    for (let i = 0; i < 28; i++) {
      const geom = geometries[Math.floor(Math.random() * geometries.length)];
      
      // Distribute shapes along the Z axis (from z = -4 to z = 4)
      // and scatter them on X/Y axes so they fly past the camera view
      const x = (Math.random() - 0.5) * 8; // -4 to +4
      const y = (Math.random() - 0.5) * 6; // -3 to +3
      const z = (Math.random() - 0.5) * 8; // -4 to +4

      // Give each item a random rotation speed multiplier
      const rotMultiplier = {
        x: (Math.random() - 0.5) * 0.8,
        y: (Math.random() - 0.5) * 0.8,
        z: (Math.random() - 0.5) * 0.8,
      };

      // Random color: cyber neon colors (cyan, purple, white)
      const colors = ['#38bdf8', '#a78bfa', '#ffffff', '#ec4899'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      arr.push({
        id: i,
        geometry: geom,
        position: [x, y, z],
        color,
        rotMultiplier,
        baseScale: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  // Update loop for audio reactivity and self-rotation
  useFrame((state) => {
    if (!groupRef.current) return;

    // Default audio values if sound is off
    const bass = window.audioData ? window.audioData.bass : 0;
    const treble = window.audioData ? window.audioData.treble : 0;
    const time = state.clock.getElapsedTime();

    // Loop through children meshes of the group
    groupRef.current.children.forEach((mesh, index) => {
      const shapeConfig = shapes[index];
      if (!shapeConfig) return;

      // 1. Audio-Reactive Scaling (Driven by Bass)
      // Scales pulse up with bass peaks (up to 40% scaling boost)
      const targetScale = shapeConfig.baseScale * (1.0 + bass * 0.55 + Math.sin(time * 2 + shapeConfig.phase) * 0.05);
      mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.1));

      // 2. Audio-Reactive Rotation (Driven by Treble + time)
      // Accelerate spin speed when high-frequency treble is active
      const spinSpeed = 1.0 + treble * 2.0;
      mesh.rotation.x += shapeConfig.rotMultiplier.x * 0.015 * spinSpeed;
      mesh.rotation.y += shapeConfig.rotMultiplier.y * 0.015 * spinSpeed;
      mesh.rotation.z += shapeConfig.rotMultiplier.z * 0.005 * spinSpeed;

      // 3. Floating Motion
      // Subtle float up/down based on sine phase
      mesh.position.y = shapeConfig.position[1] + Math.sin(time * 0.5 + shapeConfig.phase) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {shapes.map((s) => (
        <mesh key={s.id} position={s.position} geometry={s.geometry}>
          {/* Glassmorphic physical materials for a premium cyber look */}
          <meshPhysicalMaterial
            color={s.color}
            roughness={0.15}
            metalness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transmission={0.6} // Semi-transparent glass
            thickness={0.5}
            ior={1.5}
            transparent
            opacity={0.8}
            wireframe={s.id % 4 === 0} // Render every 4th mesh as wireframe
          />
        </mesh>
      ))}
    </group>
  );
}
