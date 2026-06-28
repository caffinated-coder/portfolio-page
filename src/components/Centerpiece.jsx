import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GLSL Noise and Displacement Shaders
const NoiseGLSL = `
  // Ashima Simplex Noise 3D
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const VertexShader = `
  uniform float uTime;
  uniform float uBass;
  uniform float uTreble;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNoise;

  ${NoiseGLSL}

  void main() {
    vNormal = normal;
    vPosition = position;
    
    // Wave frequency and height values scaled by music beat
    float freq = 0.8 + uBass * 0.6;
    float amp = 0.16 + uBass * 0.22;
    
    float noiseVal = snoise(position * freq + uTime * 0.42);
    vNoise = noiseVal;
    
    // Deform geometry along vertex normals
    vec3 newPosition = position + normal * noiseVal * amp;
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size scales for particle points rendering pass
    gl_PointSize = (1.5 + noiseVal * 0.8) * (8.5 / -mvPosition.z);
  }
`;

const FragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNoise;

  void main() {
    // Light calculation
    vec3 lightDir = normalize(vec3(0.5, 0.6, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    
    // Stark minimalist white/grey base shading
    vec3 color = vec3(0.95);
    
    // Shadow shading to give depth to crevices
    color = mix(vec3(0.04, 0.04, 0.05), color, diffuse * 0.78 + 0.22);
    
    // Elegant glowing edge contour (Fresnel outline reflection)
    float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
    color += vec3(1.0) * fresnel * 0.38;

    gl_FragColor = vec4(color, 0.8);
  }
`;

export default function Centerpiece() {
  const groupRef = useRef();
  const wireframeRef = useRef();
  const pointsRef = useRef();

  // Create unified shader uniforms
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uTreble: { value: 0 }
    };
  }, []);

  // Simple basic materials for fallback / edge styling
  const wireMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      uniforms: uniforms,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, [uniforms]);

  const pointsMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VertexShader,
      fragmentShader: `
        varying vec3 vNormal;
        varying float vNoise;
        void main() {
          // Circular particle clip
          vec2 pt = gl_PointCoord - vec2(0.5);
          if (dot(pt, pt) > 0.25) discard;
          
          // Pure minimalist white point glow
          gl_FragColor = vec4(1.0, 1.0, 1.0, 0.75);
        }
      `,
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, [uniforms]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const bass = window.audioData ? window.audioData.bass : 0;
    const treble = window.audioData ? window.audioData.treble : 0;

    // Update uniform values
    uniforms.uTime.value = time;
    uniforms.uBass.value = bass;
    uniforms.uTreble.value = treble;

    // 1. Slow, premium base rotation
    groupRef.current.rotation.y = time * 0.05;

    // 2. Mouse tracking projection with Lerp-based easing
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.35;
    groupRef.current.rotation.x += (targetY - groupRef.current.rotation.x) * 0.06;
    groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.06;

    // 3. Scroll scrubbing: gently scale and rotate centerpiece based on scroll position
    let scrollPercent = 0;
    const trigger = ScrollTrigger.getById('main-scroll');
    if (trigger) {
      scrollPercent = trigger.progress; // Normal 0 to 1
    }

    // Scroll scales down centerpiece slightly to make room for text
    const targetScale = 1.0 - scrollPercent * 0.28;
    groupRef.current.scale.set(targetScale, targetScale, targetScale);
    
    // Rotate faster as user scrolls down
    groupRef.current.rotation.z = scrollPercent * Math.PI * 0.5;
  });

  return (
    // Fixed viewport centering
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* High-fidelity icosahedron sphere geometry */}
      <mesh ref={wireframeRef} material={wireMaterial}>
        <icosahedronGeometry args={[1.5, 3]} />
      </mesh>

      {/* Matching points mesh that warps in unison with wireframe */}
      <points ref={pointsRef} material={pointsMaterial}>
        <icosahedronGeometry args={[1.5, 3]} />
      </points>
    </group>
  );
}
