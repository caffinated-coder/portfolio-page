import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

// Position Shader: Integrates velocity over time
const PositionShader = `
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D(texturePosition, uv);
    vec3 pos = tmpPos.xyz;
    float phase = tmpPos.w;
    
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    
    // Integrate velocity
    pos += vel;
    
    gl_FragColor = vec4(pos, phase);
  }
`;

// Velocity Shader: Handles spring physics, mouse repeller field, and turbulence wind noise
const VelocityShader = `
  uniform sampler2D texturePosition;
  uniform sampler2D textureVelocity;
  uniform sampler2D uOrgPosition;
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uBass;
  uniform float uTreble;
  uniform float uMouseRadius;
  uniform float uMouseForce;

  // Simple pseudo-random hash
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // 2D Noise helper for turbulence
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

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 vel = texture2D(textureVelocity, uv).xyz;
    vec3 orgPos = texture2D(uOrgPosition, uv).xyz;
    
    // 1. Spring force pulling back to initial layout coordinate
    vec3 distToOrg = orgPos - pos;
    vec3 springForce = distToOrg * 0.038; // Spring tension factor

    // 2. Mouse attraction/repelling field
    vec3 repulseForce = vec3(0.0);
    float distToMouse = distance(pos, uMouse);
    
    if (distToMouse < uMouseRadius) {
      // Linear scaling force: stronger closer to pointer center
      float force = (uMouseRadius - distToMouse) / uMouseRadius;
      vec3 dir = normalize(pos - uMouse);
      
      // Add slight orbital swirl components to repulsion
      vec3 swirl = vec3(-dir.y, dir.x, 0.0) * 0.4;
      
      repulseForce = (dir + swirl) * force * uMouseForce * (1.0 + uBass * 1.8);
    }

    // 3. Turbulent noise field (wind vectors)
    vec3 windForce = vec3(0.0);
    // Use multi-sample noise relative to positions and time
    float noiseValX = noise(pos.xy * 0.95 + uTime * 0.4);
    float noiseValY = noise(pos.yz * 0.95 + uTime * 0.4);
    float noiseValZ = noise(pos.zx * 0.95 + uTime * 0.4);
    
    windForce = vec3(noiseValX - 0.5, noiseValY - 0.5, noiseValZ - 0.5) * 0.012 * (1.0 + uTreble * 2.2);

    // Apply accumulated vectors to velocity
    vel += springForce + repulseForce + windForce;

    // 4. Dampening (Friction)
    vel *= 0.88; // Damping constant to avoid infinite oscillations
    
    gl_FragColor = vec4(vel, 1.0);
  }
`;

// Particle Material Shaders
const ParticleVertexShader = `
  uniform sampler2D texturePosition;
  uniform sampler2D textureVelocity;
  attribute vec2 reference;
  varying vec3 vVel;
  varying vec2 vUv;

  void main() {
    vUv = reference;
    
    vec4 posData = texture2D(texturePosition, reference);
    vec3 pos = posData.xyz;
    
    vec3 vel = texture2D(textureVelocity, reference).xyz;
    vVel = vel;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Smaller, elegant point sizes for starry dust feel
    gl_PointSize = (1.0 + length(vel) * 1.5) * (5.5 / -mvPosition.z);
  }
`;

const ParticleFragmentShader = `
  varying vec3 vVel;
  varying vec2 vUv;
  uniform float uBass;

  void main() {
    vec2 ptCoord = gl_PointCoord - vec2(0.5);
    float dist = dot(ptCoord, ptCoord);
    if (dist > 0.25) discard;

    // Stark, clean monochromatic white/grey
    vec3 finalColor = vec3(0.85);
    
    // Lower opacity to make it look subtle and background-focused
    float alpha = smoothstep(0.25, 0.03, dist) * 0.28;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function GPGPUParticles() {
  const pointsRef = useRef();
  const { gl } = useThree();
  
  // Set up 256x256 GPGPU texture layout grid = exactly 65,536 particles
  const size = 256;

  // Initialize computation renderer inside memo block
  const { gpuCompute, posVar, velVar, initialPosTexture } = useMemo(() => {
    const gpu = new GPUComputationRenderer(size, size, gl);
    
    // Enable floating point textures for precise physics
    if (gl.capabilities.isWebGL2 === false) {
      gpu.setDataType(THREE.HalfFloatType);
    }

    const dtPosition = gpu.createTexture();
    const dtVelocity = gpu.createTexture();

    const posArray = dtPosition.image.data;
    const velArray = dtVelocity.image.data;

    // Distribute particles in a beautiful 3D spherical cloud
    for (let i = 0; i < posArray.length; i += 4) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.4 + Math.random() * 0.6; // Cloud shell radius bounds

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      posArray[i] = x;
      posArray[i + 1] = y;
      posArray[i + 2] = z;
      posArray[i + 3] = Math.random(); // Random phase for offset noise

      // Velocities initialized to zero
      velArray[i] = 0;
      velArray[i + 1] = 0;
      velArray[i + 2] = 0;
      velArray[i + 3] = 0;
    }

    const positionVariable = gpu.addVariable('texturePosition', PositionShader, dtPosition);
    const velocityVariable = gpu.addVariable('textureVelocity', VelocityShader, dtVelocity);

    gpu.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    gpu.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);

    // Initial position copy passed to velocity shader as a static uniform texture
    velocityVariable.material.uniforms.uOrgPosition = { value: dtPosition };
    
    velocityVariable.material.uniforms.uTime = { value: 0 };
    velocityVariable.material.uniforms.uMouse = { value: new THREE.Vector3(0, 0, 999.0) };
    velocityVariable.material.uniforms.uBass = { value: 0 };
    velocityVariable.material.uniforms.uTreble = { value: 0 };
    velocityVariable.material.uniforms.uMouseRadius = { value: 1.3 };
    velocityVariable.material.uniforms.uMouseForce = { value: 0.16 };

    positionVariable.material.uniforms.uTime = { value: 0 };

    const error = gpu.init();
    if (error !== null) {
      console.error('GPGPU Initialization Error:', error);
    }

    return { 
      gpuCompute: gpu, 
      posVar: positionVariable, 
      velVar: velocityVariable, 
      initialPosTexture: dtPosition 
    };
  }, [gl]);

  // Construct particle references coordinates attribute (2D layout coordinates for texture sampling)
  const referencesAttribute = useMemo(() => {
    const references = new Float32Array(size * size * 2);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = (i * size + j) * 2;
        references[index] = i / (size - 1);
        references[index + 1] = j / (size - 1);
      }
    }
    return new THREE.BufferAttribute(references, 2);
  }, []);

  // Point shader material setup
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: ParticleVertexShader,
      fragmentShader: ParticleFragmentShader,
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        uBass: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  // Update uniforms and run GPGPU calculation passes inside R3F render frame loops
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const bass = window.audioData ? window.audioData.bass : 0;
    const treble = window.audioData ? window.audioData.treble : 0;

    // Project normalized pointer coordinates to 3D coordinates at z=0 plane
    const vector = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5);
    vector.unproject(state.camera);
    const dir = vector.sub(state.camera.position).normalize();
    const distance = -state.camera.position.z / dir.z;
    const mouse3D = state.camera.position.clone().add(dir.multiplyScalar(distance));

    // Update GPGPU uniforms
    velVar.material.uniforms.uTime.value = time;
    velVar.material.uniforms.uBass.value = bass;
    velVar.material.uniforms.uTreble.value = treble;
    
    // Scale mouse push radius slightly with audio bass kicks
    velVar.material.uniforms.uMouseRadius.value = 1.3 + bass * 0.4;

    // Track mouse coordinates if mouse is moving inside window
    if (Math.abs(state.pointer.x) < 0.99 && Math.abs(state.pointer.y) < 0.99) {
      velVar.material.uniforms.uMouse.value.copy(mouse3D);
    } else {
      // Put mouse offscreen
      velVar.material.uniforms.uMouse.value.set(0, 0, 999.0);
    }

    posVar.material.uniforms.uTime.value = time;

    // Run GPU calculations pass (ping-ponging automatically handled inside GPUComputationRenderer)
    gpuCompute.compute();

    // Pass result textures to Points shader material
    material.uniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(posVar).texture;
    material.uniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget(velVar).texture;
    material.uniforms.uBass.value = bass;
  });

  // Clean up WebGL computation render targets on unmount
  useEffect(() => {
    return () => {
      gpuCompute.getCurrentRenderTarget(posVar).dispose();
      gpuCompute.getCurrentRenderTarget(velVar).dispose();
      initialPosTexture.dispose();
      material.dispose();
    };
  }, [gpuCompute, posVar, velVar, initialPosTexture, material]);

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        {/* Particle Reference coordinates attribute */}
        <bufferAttribute attach="attributes-reference" {...referencesAttribute} />
        {/* Dummy position coordinates required for points geometry structure */}
        <bufferAttribute 
          attach="attributes-position" 
          args={[new Float32Array(size * size * 3), 3]} 
        />
      </bufferGeometry>
    </points>
  );
}
