import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FluidGLSL = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uBass;
    uniform float uTreble;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Fractional Brownian Motion (fBm) noise helper
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    // 4 Octaves of noise for organic fluid warping
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotate octaves to reduce grid artifacts
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Normalize coordinate system
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      
      // Keep aspect ratio
      st.x *= uResolution.x / uResolution.y;

      // Coordinate distortion speed scale
      // Bass amplifies the velocity of the fluid ripples
      float speed = uTime * (0.25 + uBass * 1.5);
      
      // Domain Warping: Nest fBm calls for chaotic swirling fluid flow
      vec2 q = vec2(0.0);
      q.x = fbm(st + vec2(0.0, 0.0) + vec2(speed * 0.1));
      q.y = fbm(st + vec2(1.0, 1.0) + vec2(speed * 0.15));

      vec2 r = vec2(0.0);
      r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + vec2(speed * 0.15));
      r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + vec2(speed * 0.1));

      // Add mouse coordinate impact on fluid swirling center
      float distToMouse = distance(vUv, uMouse);
      float mouseInfluence = smoothstep(0.5, 0.0, distToMouse) * 0.25;
      
      // Dynamic noise density driven by treble and mouse
      float f = fbm(st + r * (3.0 + uTreble * 5.0) + vec2(mouseInfluence));

      // Build vibrant cyber neon color palette
      // Color 1: Deep black/indigo background
      vec3 colorBackground = vec3(0.01, 0.02, 0.05);
      
      // Color 2: Electric Cyan (glowing high frequencies)
      vec3 colorCyan = vec3(0.22, 0.74, 0.97) * (1.0 + uTreble * 1.5);
      
      // Color 3: Hot Purple/Pink (pulsing low frequencies)
      vec3 colorPurple = vec3(0.65, 0.54, 0.98) * (1.0 + uBass * 1.8);

      // Interpolate colors based on nested fBm outputs
      vec3 color = mix(colorBackground, colorCyan, f);
      color = mix(color, colorPurple, dot(q, q) * 1.2);
      
      // Add glowing white hot spots where frequencies spike heavily
      color += vec3(0.9, 0.95, 1.0) * pow(f, 4.0) * (uBass * 1.3);

      // Soft vignette border so shader fades seamlessly at canvas margins
      float vignette = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) * 
                      smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
      color *= vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

export default function FluidShader() {
  const meshRef = useRef();

  // Create memoized shader uniforms
  const uniforms = useMemo(() => {
    return {
      uResolution: { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight) },
      uTime: { value: 0 },
      uBass: { value: 0 },
      uTreble: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    };
  }, []);

  // Update uniforms in render loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const bass = window.audioData ? window.audioData.bass : 0;
    const treble = window.audioData ? window.audioData.treble : 0;

    // Track cursor projected inside the local shader aspect
    const pointerX = (state.pointer.x + 1) * 0.5; // Map from -1,1 to 0,1
    const pointerY = (state.pointer.y + 1) * 0.5;

    meshRef.current.material.uniforms.uTime.value = time;
    meshRef.current.material.uniforms.uBass.value = bass;
    meshRef.current.material.uniforms.uTreble.value = treble;
    meshRef.current.material.uniforms.uMouse.value.set(pointerX, pointerY);
    meshRef.current.material.uniforms.uResolution.value.set(
      window.innerWidth / 2,
      window.innerHeight
    );
  });

  return (
    // Position the fluid plane on the right half of the viewport
    // fov=60 at z=5 gives a viewport width of ~5.7. Shifting x by 1.4 sits it perfectly on the right.
    <mesh ref={meshRef} position={[1.4, 0, 0]}>
      <planeGeometry args={[3.2, 5.0, 1, 1]} />
      <shaderMaterial
        vertexShader={FluidGLSL.vertexShader}
        fragmentShader={FluidGLSL.fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
