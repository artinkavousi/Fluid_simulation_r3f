import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneObjects } from './SceneObjects';
import { PostProcessing } from './PostProcessing';
import { useStore } from '../store/useStore';
import { FluidSolver } from '../utils/FluidSolver';
import * as THREE from 'three';

function FluidSimulation() {
  const { gl, size, camera } = useThree();
  const solverRef = useRef<FluidSolver>();
  const prevMouseRef = useRef<[number, number]>([0, 0]);
  const setMousePos = useStore(state => state.setMousePos);
  const dt = useStore(state => state.dt);
  const materialRef = useRef<THREE.ShaderMaterial>();
  const textureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.left = -1;
      camera.right = 1;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    }
  }, [camera, size]);

  useEffect(() => {
    solverRef.current = new FluidSolver(gl, size.width, size.height);
    
    materialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null }
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
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(uTexture, vUv);
          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `
    });

    return () => {
      solverRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, [gl, size]);

  useFrame((state) => {
    if (solverRef.current) {
      solverRef.current.step(dt);
      
      const newTexture = solverRef.current.getDyeTexture();
      if (textureRef.current !== newTexture) {
        textureRef.current = newTexture;
        if (materialRef.current) {
          materialRef.current.uniforms.uTexture.value = newTexture;
        }
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
      solverRef.current.splat(
        x, y,
        dx * 10, dy * 10,
        [Math.random(), Math.random(), Math.random()]
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
      style={{ width: '100%', height: '100%' }}
      camera={{ 
        position: [0, 0, 1],
        near: 0.1,
        far: 1000,
        fov: 45
      }}
      orthographic
    >
      <color attach="background" args={backgroundColor} />
      <FluidSimulation />
      <SceneObjects />
      <PostProcessing />
    </Canvas>
  );
} 