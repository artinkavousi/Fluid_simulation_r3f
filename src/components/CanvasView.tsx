import { useThree, useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';
import { FluidSolver } from '../utils/FluidSolver';
import { FluidDisplay } from './FluidDisplay';
import * as THREE from 'three';

export function CanvasView() {
  const { gl, size } = useThree();
  const store = useStore();
  const solverRef = useRef<FluidSolver | null>(null);
  const prevMouseRef = useRef<[number, number]>([0, 0]);
  const setMousePos = useStore(state => state.setMousePos);

  useEffect(() => {
    if (!solverRef.current) {
      solverRef.current = new FluidSolver(gl, size.width, size.height);
      useStore.setState({ fluidSolver: solverRef.current });
      
      // Update solver parameters after initialization
      solverRef.current.updateParams({
        dt: store.dt,
        dyeDecay: store.dyeDecay,
        pressureIterations: store.pressureIterations,
        curlStrength: store.curlStrength,
        viscosity: store.viscosity,
        temperature: store.temperature,
        buoyancy: store.buoyancy,
        density: store.density,
        diffusion: store.diffusion,
        velocityDissipation: store.velocityDissipation,
        temperatureDissipation: store.temperatureDissipation,
        pressureDissipation: store.pressureDissipation,
        colorDiffusion: store.colorDiffusion,
        audioReactivity: store.audioReactivity,
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
    }

    return () => {
      if (solverRef.current) {
        solverRef.current.dispose();
        solverRef.current = null;
        useStore.setState({ fluidSolver: null });
      }
    };
  }, [gl, size]);

  // Update solver parameters when store changes
  useEffect(() => {
    if (solverRef.current) {
      solverRef.current.updateParams({
        dt: store.dt,
        dyeDecay: store.dyeDecay,
        pressureIterations: store.pressureIterations,
        curlStrength: store.curlStrength,
        viscosity: store.viscosity,
        temperature: store.temperature,
        buoyancy: store.buoyancy,
        density: store.density,
        diffusion: store.diffusion,
        velocityDissipation: store.velocityDissipation,
        temperatureDissipation: store.temperatureDissipation,
        pressureDissipation: store.pressureDissipation,
        colorDiffusion: store.colorDiffusion,
        audioReactivity: store.audioReactivity,
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
    }
  }, [store]);

  useFrame((_state, delta) => {
    if (solverRef.current) {
      solverRef.current.step(delta);
    }
  });

  const handlePointerMove = (event: THREE.Event) => {
    const e = event as unknown as PointerEvent;
    const rect = gl.domElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
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
    <group>
      <mesh onPointerMove={handlePointerMove}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <FluidDisplay />
    </group>
  );
} 