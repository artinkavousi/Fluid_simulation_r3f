import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { FluidSolver } from '../utils/FluidSolver';
import * as THREE from 'three';

export const CanvasView: React.FC = () => {
  const { gl, size } = useThree();
  const solverRef = useRef<FluidSolver>();
  const prevMouseRef = useRef<[number, number]>([0, 0]);
  const setMousePos = useStore(state => state.setMousePos);
  const store = useStore();

  useEffect(() => {
    // Initialize fluid solver with proper context
    solverRef.current = new FluidSolver(gl, size.width, size.height);

    return () => {
      solverRef.current?.dispose();
    };
  }, [gl, size]);

  useFrame((state, delta) => {
    if (!solverRef.current) return;
    
    // Update fluid simulation
    solverRef.current.step(delta);
    
    // Update fluid parameters from store
    solverRef.current.updateParams({
      dt: store.dt,
      viscosity: store.viscosity,
      density: store.density,
      pressure: store.pressure,
      temperature: store.temperature,
      curlStrength: store.curlStrength,
      vorticityScale: store.vorticityScale,
      colorIntensity: store.colorIntensity,
      colorMixing: store.colorMixing,
      rainbowEffect: store.rainbowEffect,
      bloomStrength: store.bloomStrength,
      chromaticAberration: store.chromaticAberration,
      motionBlurStrength: store.motionBlurStrength,
      kaleidoscopeSegments: store.kaleidoscopeSegments,
      kaleidoscopeRotation: store.kaleidoscopeRotation,
      distortionStrength: store.distortionStrength,
      noiseScale: store.noiseScale,
      pulseSpeed: store.pulseSpeed,
      waveAmplitude: store.waveAmplitude
    });
  });

  const handlePointerMove = (event: THREE.Event) => {
    const e = event as unknown as PointerEvent;
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = 1.0 - ((e.clientY - rect.top) / rect.height);
    setMousePos([x * 2 - 1, y * 2 - 1]);

    if (solverRef.current) {
      const dx = x - prevMouseRef.current[0];
      const dy = y - prevMouseRef.current[1];
      solverRef.current.splat(
        x, y,
        dx * 10, dy * 10,
        [Math.random(), Math.random(), Math.random()],
        store.temperature
      );
      prevMouseRef.current = [x, y];
    }
  };

  return (
    <mesh onPointerMove={handlePointerMove}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={{
          tDiffuse: { value: solverRef.current?.getDyeTexture() || null },
          tVelocity: { value: solverRef.current?.getVelocityTexture() || null },
          tPressure: { value: solverRef.current?.getPressureTexture() || null },
          tTemperature: { value: solverRef.current?.getTemperatureTexture() || null },
          renderMode: { value: store.renderMode === 'dye' ? 0 : store.renderMode === 'velocity' ? 1 : store.renderMode === 'pressure' ? 2 : 3 }
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D tDiffuse;
          uniform sampler2D tVelocity;
          uniform sampler2D tPressure;
          uniform sampler2D tTemperature;
          uniform int renderMode;
          varying vec2 vUv;

          void main() {
            if (renderMode == 0) {
              gl_FragColor = texture2D(tDiffuse, vUv);
            } else if (renderMode == 1) {
              vec2 vel = texture2D(tVelocity, vUv).xy;
              float mag = length(vel);
              gl_FragColor = vec4(vel * 0.5 + 0.5, mag, 1.0);
            } else if (renderMode == 2) {
              float p = texture2D(tPressure, vUv).x;
              gl_FragColor = vec4(vec3(p * 0.5 + 0.5), 1.0);
            } else {
              float t = texture2D(tTemperature, vUv).x;
              gl_FragColor = vec4(t, 0.0, 1.0 - t, 1.0);
            }
          }
        `}
      />
    </mesh>
  );
}; 