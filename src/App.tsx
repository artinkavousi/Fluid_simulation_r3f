import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CanvasView } from './components/CanvasView';
import { ControlPanel } from './components/UI/ControlPanel';
import { useStore } from './store/useStore';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const backgroundColor = useStore(state => state.backgroundColor);

  return (
    <ErrorBoundary>
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true
          }}
          orthographic
          camera={{
            left: -1,
            right: 1,
            top: 1,
            bottom: -1,
            near: 0,
            far: 1,
            position: [0, 0, 1]
          }}
        >
          <color attach="background" args={[backgroundColor[0], backgroundColor[1], backgroundColor[2]]} />
          <CanvasView />
        </Canvas>
        <ControlPanel />
      </div>
    </ErrorBoundary>
  );
} 