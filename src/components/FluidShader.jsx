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

    // Cosine palette generator for shifting iridescent color spectrums
    vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
      return a + b * cos(6.28318 * (c * t + d));
    }

    // 2D Noise helper functions
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(in vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    // 5-Octave Fractional Brownian Motion (fBm) for detailed liquid flows
    float fbm(in vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    // Solve fluid displacement heightmap at coordinates
    float getFluidHeight(vec2 uv, float t) {
      // Domain Warping: Nested fBm warping to simulate swirling vortices
      vec2 q = vec2(0.0);
      q.x = fbm(uv + vec2(0.0, 0.0) + vec2(t * 0.12));
      q.y = fbm(uv + vec2(1.0, 1.0) + vec2(t * 0.08));

      vec2 r = vec2(0.0);
      r.x = fbm(uv + 1.6 * q + vec2(1.7, 9.2) + vec2(t * 0.15));
      r.y = fbm(uv + 1.6 * q + vec2(8.3, 2.8) + vec2(t * 0.11));

      // Calculate mouse attraction displacement
      float dist = distance(vUv, uMouse);
      float mouseForce = smoothstep(0.45, 0.0, dist) * 0.14 * (1.0 + uBass * 1.5);
      
      // Warp height relative to mouse distance
      return fbm(uv + r * 2.6 + (vUv - uMouse) * mouseForce);
    }

    void main() {
      vec2 uv = vUv;
      
      // Slow, smooth time flow boosted slightly by bass beat triggers
      float t = uTime * 0.38 + uBass * 0.12;

      // 1. Calculate heightmap details for normal mapping
      float eps = 0.007; // Offset spacing for height slopes
      float h = getFluidHeight(uv, t);
      float h_r = getFluidHeight(uv + vec2(eps, 0.0), t);
      float h_u = getFluidHeight(uv + vec2(0.0, eps), t);

      // Compute normal slopes (derivatives of fBm height)
      float nx = (h_r - h) / eps;
      float ny = (h_u - h) / eps;

      // Surface Normal Vector (shaping a metallic liquid sheet)
      // Lowering the z-depth makes normals hyper-reactive to slopes, maximizing shiny reflection glare
      vec3 normal = normalize(vec3(nx, ny, 0.14));

      // 2. Simple Environment Lighting
      vec3 lightDir = normalize(vec3(0.35, 0.55, 0.85));
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      
      // Reflection highlight vectors
      vec3 reflectDir = reflect(-lightDir, normal);
      float spec = max(dot(reflectDir, viewDir), 0.0);
      spec = pow(spec, 10.0); // Create narrow, glowing chrome specular glares

      // 3. Chromatic Iridescence Cosine Mapping
      // Color shifts based on height values, treble spikes, and normal slopes
      float colorIndex = h * 0.72 + normal.y * 0.28 + uTreble * 0.16;

      // Cosine phases for a pearlescent, oil-slick spectrum:
      // a,b = [0.5, 0.5, 0.5] (brightness offset and amplitude)
      // c = frequency multipliers (RGB phases cycle at slightly offset speeds for prism split)
      // d = offsets (RGB starts phases at 0 deg, 120 deg, 240 deg respectively)
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 0.82, 1.25);
      vec3 d = vec3(0.0, 0.33, 0.67);

      vec3 fluidColor = palette(colorIndex, a, b, c, d);

      // 4. Shading & Shadows
      // Dark slate shadow base for depth contrast
      vec3 shadowColor = vec3(0.015, 0.03, 0.06);
      
      // Light diffuse intensity
      float diffuse = max(dot(normal, lightDir), 0.0);
      
      // Blend dark shadows, iridescent shimmer, and metallic specular highlights
      vec3 finalColor = mix(shadowColor, fluidColor, diffuse * 0.82 + 0.18);
      
      // Add chrome shines
      finalColor += vec3(0.92, 0.95, 1.0) * spec * 0.75;

      // Add high-frequency scanline noise scaled by audio treble
      float scanline = sin(uv.y * 320.0 + uTime * 6.5) * 0.02 * (1.0 + uTreble * 2.0);
      finalColor -= vec3(scanline);

      // Vignette border to blend seamlessly into the matte black layout margin
      float vignette = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x) * 
                      smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.92, uv.y);
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor, 1.0);
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
