import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { PostProcessing } from './PostProcessing';
import { useStore } from '../store/useStore';
import { FluidSolver } from '../utils/FluidSolver';
import * as THREE from 'three';

function FluidSimulation() {
  const { gl, size } = useThree();
  const solverRef = useRef<FluidSolver>();
  const prevMouseRef = useRef<[number, number]>([0, 0]);
  const setMousePos = useStore(state => state.setMousePos);
  const dt = useStore(state => state.dt);
  const renderMode = useStore(state => state.renderMode);
  const params = useStore(state => ({
    dt: state.dt,
    pressureIterations: state.pressureIterations,
    curlStrength: state.curlStrength,
    viscosity: state.viscosity,
    temperature: state.temperature,
    buoyancy: state.buoyancy,
    density: state.density,
    diffusion: state.diffusion,
    velocityDissipation: state.velocityDissipation,
    temperatureDissipation: state.temperatureDissipation,
    pressureDissipation: state.pressureDissipation,
    colorDiffusion: state.colorDiffusion,
    audioReactivity: state.audioReactivity,
    vorticityScale: state.vorticityScale,
    colorIntensity: state.colorIntensity,
    colorMixing: state.colorMixing,
    rainbowEffect: state.rainbowEffect,
    bloomStrength: state.bloomStrength,
    chromaticAberration: state.chromaticAberration,
    motionBlurStrength: state.motionBlurStrength,
    kaleidoscopeSegments: state.kaleidoscopeSegments,
    kaleidoscopeRotation: state.kaleidoscopeRotation,
    distortionStrength: state.distortionStrength,
    noiseScale: state.noiseScale,
    pulseSpeed: state.pulseSpeed,
    waveAmplitude: state.waveAmplitude
  }));

  const materialRef = useRef<THREE.ShaderMaterial>();

  useEffect(() => {
    solverRef.current = new FluidSolver(gl, size.width, size.height);
    useStore.setState({ fluidSolver: solverRef.current });
    
    materialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uMode: { value: 0 },
        uTime: { value: 0 },
        uKaleidoscope: { value: new THREE.Vector2(0, 0) },
        uRainbow: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform int uMode;
        uniform float uTime;
        uniform vec2 uKaleidoscope;
        uniform float uRainbow;
        varying vec2 vUv;

        vec3 temperatureToColor(float temp) {
          vec3 cold = vec3(0.0, 0.0, 1.0);
          vec3 medium = vec3(1.0, 1.0, 0.0);
          vec3 hot = vec3(1.0, 0.0, 0.0);
          
          if (temp < 0.5) {
            return mix(cold, medium, temp * 2.0);
          } else {
            return mix(medium, hot, (temp - 0.5) * 2.0);
          }
        }

        vec3 rainbow(float t) {
          vec3 c = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
          return c * c;
        }

        vec2 kaleidoscope(vec2 uv, float segments, float rotation) {
          if (segments <= 0.0) return uv;
          
          vec2 center = vec2(0.5);
          vec2 coord = uv - center;
          float angle = atan(coord.y, coord.x) + rotation;
          float radius = length(coord);
          angle = mod(angle, 6.28318 / segments) - 3.14159 / segments;
          return vec2(cos(angle), sin(angle)) * radius + center;
        }

        void main() {
          vec2 uv = vUv;
          
          if (uKaleidoscope.x > 0.0) {
            uv = kaleidoscope(uv, uKaleidoscope.x, uKaleidoscope.y);
          }

          vec4 texColor = texture2D(uTexture, uv);
          vec3 finalColor;

          if (uMode == 0) { // Dye
            finalColor = texColor.rgb;
            if (uRainbow > 0.0) {
              vec3 rainbowColor = rainbow(uv.x + uTime * 0.1);
              finalColor = mix(finalColor, rainbowColor, uRainbow * length(finalColor));
            }
          } else if (uMode == 1) { // Velocity
            vec2 vel = texColor.xy;
            float mag = length(vel);
            finalColor = vec3(mag, vel * 0.5 + 0.5);
          } else if (uMode == 2) { // Pressure
            float p = texColor.x;
            finalColor = vec3((p + 1.0) * 0.5);
          } else if (uMode == 3) { // Temperature
            float temp = texColor.x;
            finalColor = temperatureToColor(temp);
          } else if (uMode == 4) { // Rainbow
            finalColor = rainbow(uv.x + uTime * 0.2);
          } else { // Default to dye mode
            finalColor = texColor.rgb;
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    return () => {
      solverRef.current?.dispose();
      materialRef.current?.dispose();
      useStore.setState({ fluidSolver: null });
    };
  }, [gl, size]);

  useEffect(() => {
    if (solverRef.current) {
      solverRef.current.updateParams(params);
    }
  }, [params]);

  useFrame((state) => {
    if (solverRef.current && materialRef.current) {
      solverRef.current.step(dt);
      
      let texture;
      let modeValue;
      
      switch (renderMode) {
        case 'dye':
          texture = solverRef.current.getDyeTexture();
          modeValue = 0;
          break;
        case 'velocity':
          texture = solverRef.current.getVelocityTexture();
          modeValue = 1;
          break;
        case 'pressure':
          texture = solverRef.current.getPressureTexture();
          modeValue = 2;
          break;
        case 'temperature':
          texture = solverRef.current.getTemperatureTexture();
          modeValue = 3;
          break;
        case 'rainbow':
          texture = solverRef.current.getDyeTexture();
          modeValue = 4;
          break;
        case 'kaleidoscope':
          texture = solverRef.current.getDyeTexture();
          modeValue = 0;
          break;
        default:
          texture = solverRef.current.getDyeTexture();
          modeValue = 0;
      }
      
      if (texture) {
        materialRef.current.uniforms.uTexture.value = texture;
        materialRef.current.uniforms.uMode.value = modeValue;
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        
        const segments = renderMode === 'kaleidoscope' ? Math.max(2, params.kaleidoscopeSegments) : params.kaleidoscopeSegments;
        materialRef.current.uniforms.uKaleidoscope.value.set(
          segments,
          params.kaleidoscopeRotation
        );
        
        materialRef.current.uniforms.uRainbow.value = params.rainbowEffect;

        const velocityTexture = solverRef.current.getVelocityTexture();
        useStore.setState({ velocityTexture });
      }
    }
  });

  const handlePointerMove = (event: THREE.Event) => {
    const e = event as unknown as PointerEvent;
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = 1.0 - ((e.clientY - rect.top) / rect.height);
    setMousePos([x * 2 - 1, y * 2 - 1]);

    if (solverRef.current) {
      const dx = x - prevMouseRef.current[0];
      const dy = y - prevMouseRef.current[1];
      const velocity = Math.sqrt(dx * dx + dy * dy);
      const temperature = Math.min(1.0, velocity * 20);
      
      const color: [number, number, number] = [1.0, 0.5, 0.0];
      
      solverRef.current.splat(
        x, y,
        dx * 10, dy * 10,
        color,
        temperature
      );
      prevMouseRef.current = [x, y];
    }
  };

  return (
    <mesh onPointerMove={handlePointerMove}>
      <planeGeometry args={[2, 2]} />
      {materialRef.current && <primitive object={materialRef.current} attach="material" />}
    </mesh>
  );
}

export function CanvasView() {
  const backgroundColor = useStore(state => state.backgroundColor);

  return (
    <Canvas
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        depth: false,
        powerPreference: 'high-performance'
      }}
      camera={{ position: [0, 0, 1], near: 0.1, far: 1000 }}
      style={{ background: `rgb(${backgroundColor.join(',')})` }}
    >
      <FluidSimulation />
      <PostProcessing />
    </Canvas>
  );
} 