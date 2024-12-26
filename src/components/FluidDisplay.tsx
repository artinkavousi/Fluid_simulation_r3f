import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export function FluidDisplay() {
  const renderMode = useStore(state => state.renderMode);
  const fluidSolver = useStore(state => state.fluidSolver);

  const { material, geometry } = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tVelocity: { value: null },
        tPressure: { value: null },
        tTemperature: { value: null },
        renderMode: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tVelocity;
        uniform sampler2D tPressure;
        uniform sampler2D tTemperature;
        uniform int renderMode;
        varying vec2 vUv;

        void main() {
          if (renderMode == 0) {
            // Dye mode
            gl_FragColor = texture2D(tDiffuse, vUv);
          } else if (renderMode == 1) {
            // Velocity mode
            vec2 vel = texture2D(tVelocity, vUv).xy;
            float mag = length(vel);
            gl_FragColor = vec4(vel * 0.5 + 0.5, mag, 1.0);
          } else if (renderMode == 2) {
            // Pressure mode
            float p = texture2D(tPressure, vUv).x;
            gl_FragColor = vec4(vec3(p * 0.5 + 0.5), 1.0);
          } else {
            // Temperature mode
            float t = texture2D(tTemperature, vUv).x;
            gl_FragColor = vec4(t, 0.0, 1.0 - t, 1.0);
          }
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    return { geometry, material };
  }, []);

  useEffect(() => {
    // Update render mode
    material.uniforms.renderMode.value = 
      renderMode === 'dye' ? 0 :
      renderMode === 'velocity' ? 1 :
      renderMode === 'pressure' ? 2 : 3;
  }, [renderMode, material]);

  useFrame(() => {
    if (fluidSolver) {
      material.uniforms.tDiffuse.value = fluidSolver.getDyeTexture();
      material.uniforms.tVelocity.value = fluidSolver.getVelocityTexture();
      material.uniforms.tPressure.value = fluidSolver.getPressureTexture();
      material.uniforms.tTemperature.value = fluidSolver.getTemperatureTexture();
    }
  });

  return (
    <mesh geometry={geometry} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
} 