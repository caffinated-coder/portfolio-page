import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';

export default function GalleryItems() {
  const groupRef = useRef();

  // High-quality, royalty-free digital assets from Unsplash representing Sanjay's profile
  const cards = [
    { 
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', // Satellite digital globe for Geopolitical Research
      position: [-2.4, 0, 0.2], 
      rotation: [0, 0.25, 0] 
    },
    { 
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', // Misty high-contrast mountains for Travels
      position: [0, 0, 0], 
      rotation: [0, 0, 0] 
    },
    { 
      url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80', // Close-up acoustic guitar for Sonic Pursuits
      position: [2.4, 0, 0.2], 
      rotation: [0, -0.25, 0] 
    }
  ];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const bass = window.audioData ? window.audioData.bass : 0;

    groupRef.current.children.forEach((mesh, index) => {
      const config = cards[index];
      if (!config) return;

      // Subtle float up and down to feel light and floating
      mesh.position.y = config.position[1] + Math.sin(time * 0.5 + index * 1.5) * 0.12;

      // Very subtle scaling pulse on music beat
      const scaleVal = 1.0 + bass * 0.06;
      mesh.scale.set(scaleVal, scaleVal, scaleVal);
    });
  });

  return (
    <group ref={groupRef}>
      {cards.map((item, index) => (
        <group key={index} position={item.position} rotation={item.rotation}>
          {/* Drei Image component automatically handles WebGL texture loading and grayscale rendering */}
          <Image 
            url={item.url} 
            grayscale={1.0} // Clean, stark black-and-white look
            transparent 
            opacity={0.65} // Low opacity to blend into the dark background
            scale={[1.8, 1.8]}
          />
        </group>
      ))}
    </group>
  );
}
