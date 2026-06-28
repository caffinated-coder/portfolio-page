import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Shader code for subtle audio-reactive warping and chromatic aberration glitch
const GlitchShader = {
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uBass;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Subtly warp the plane vertices using a sine wave scaled by the bass amplitude
      pos.z += sin(pos.x * 3.0 + uTime * 2.0) * 0.1 * uBass;
      pos.z += cos(pos.y * 3.0 + uTime * 2.0) * 0.1 * uBass;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uTreble;
    
    // Pseudo-random noise function
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      // Calculate a threshold-based glitch factor driven by the treble level
      float glitchAmount = uTreble * 0.08;
      
      // Apply horizontal glitch jumps based on noise and high frequencies
      if (uTreble > 0.3 && rand(vec2(floor(uv.y * 15.0), uTime)) < 0.25) {
        uv.x += (rand(vec2(uTime, uv.y)) - 0.5) * glitchAmount;
      }
      
      // Chromatic aberration (color channel offset splitting)
      vec4 rColor = texture2D(uTexture, uv + vec2(glitchAmount * 0.12, 0.0));
      vec4 gColor = texture2D(uTexture, uv);
      vec4 bColor = texture2D(uTexture, uv - vec2(glitchAmount * 0.12, 0.0));
      
      vec4 finalColor = vec4(rColor.r, gColor.g, bColor.b, 1.0);
      
      // Add subtle scanline overlays
      float scanline = sin(uv.y * 200.0 + uTime * 4.0) * 0.03 * (1.0 + uTreble * 2.0);
      finalColor.rgb -= vec3(scanline);
      
      gl_Position = vec4(finalColor);
    }
  `
};

export default function GalleryItems() {
  const groupRef = useRef();

  // Helper: Draw gorgeous abstract procedural graphics on temporary HTML Canvases
  const textures = useMemo(() => {
    const createPlaceholderTexture = (title, subtitle, color1, color2, drawExtra) => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // 1. Draw rich background gradient
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // 2. Draw abstract geometric layout lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let i = 0; i < size; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }

      // 3. Invoke custom drawing block for specific section themes
      if (drawExtra) drawExtra(ctx, size);

      // 4. Draw overlay gradient border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, size - 16, size - 16);

      // 5. Draw labels/typography
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.fillText(title.toUpperCase(), 36, size - 85);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '500 16px Inter, sans-serif';
      ctx.fillText(subtitle.toUpperCase(), 38, size - 50);

      // Render indicator tag
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(36, 36, 120, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('LIFE & BEYOND', 52, 53);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Card 1: Geopolitical Research (Deep slate grid & digital orbit overlay)
    const t1 = createPlaceholderTexture(
      'Geopolitical Risk',
      'Research & Area Studies',
      '#050b14',
      '#10223b',
      (ctx, size) => {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 3, 100, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
        ctx.beginPath();
        ctx.arc(size / 2, size / 3, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(size / 2 + 70, size / 3 - 70, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    );

    // Card 2: Travels (Foggy valley & vector peaks)
    const t2 = createPlaceholderTexture(
      'Wanderlust',
      'Misty Peaks of Assam & Delhi',
      '#0a160d',
      '#193822',
      (ctx, size) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(100, 300);
        ctx.lineTo(250, 100);
        ctx.lineTo(400, 300);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(180, 300);
        ctx.lineTo(320, 140);
        ctx.lineTo(460, 300);
        ctx.closePath();
        ctx.fill();
      }
    );

    // Card 3: Guitar & Beyond Academics (Vibrant magenta waveforms)
    const t3 = createPlaceholderTexture(
      'Sonic Pursuits',
      'Acoustic Guitar & Web Audio',
      '#1c0316',
      '#4c0b3c',
      (ctx, size) => {
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 40; x < size - 40; x += 5) {
          const y = size / 3 + Math.sin(x * 0.05) * 40 * Math.cos(x * 0.02);
          if (x === 40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    );

    return [
      { texture: t1, position: [-2.4, 0, 0.2], rotation: [0, 0.25, 0] },
      { texture: t2, position: [0, 0, 0.0], rotation: [0, 0, 0] },
      { texture: t3, position: [2.4, 0, 0.2], rotation: [0, -0.25, 0] },
    ];
  }, []);

  // Set up uniforms for custom shader materials
  const shaderMaterials = useMemo(() => {
    return textures.map((item) => {
      return new THREE.ShaderMaterial({
        vertexShader: GlitchShader.vertexShader,
        fragmentShader: GlitchShader.fragmentShader,
        uniforms: {
          uTexture: { value: item.texture },
          uTime: { value: 0 },
          uBass: { value: 0 },
          uTreble: { value: 0 }
        },
        transparent: true,
        side: THREE.DoubleSide
      });
    });
  }, [textures]);

  // Update uniforms and slide positions inside render loop
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const bass = window.audioData ? window.audioData.bass : 0;
    const treble = window.audioData ? window.audioData.treble : 0;

    shaderMaterials.forEach((material, index) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uBass.value = bass;
      material.uniforms.uTreble.value = treble;
    });

    // Subtly float individual panels
    groupRef.current.children.forEach((mesh, index) => {
      const config = textures[index];
      if (!config) return;

      // 1. Audio-Reactive Pulsing: Scale slightly larger during heavy bass kicks
      const pulseScale = 1.0 + bass * 0.12;
      mesh.scale.set(pulseScale, pulseScale, pulseScale);

      // 2. Parallax floating motion
      mesh.position.y = config.position[1] + Math.sin(time * 0.6 + index * 1.5) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {textures.map((item, index) => (
        <mesh 
          key={index} 
          position={item.position} 
          rotation={item.rotation}
          material={shaderMaterials[index]}
        >
          <planeGeometry args={[1.8, 1.8, 16, 16]} />
        </mesh>
      ))}
    </group>
  );
}
