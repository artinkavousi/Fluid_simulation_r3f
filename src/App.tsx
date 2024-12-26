import { Canvas } from '@react-three/fiber';
import { CanvasView } from './components/CanvasView';
import { ControlPanel } from './components/UI/ControlPanel';
import { useStore } from './store/useStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PostProcessing } from './components/PostProcessing';
import { SimulationManager } from './components/SimulationManager';

export default function App() {
  const backgroundColor = useStore(state => state.backgroundColor);

  return (
    <ErrorBoundary>
      <SimulationManager>
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
            <PostProcessing />
          </Canvas>
          <ControlPanel />
        </div>
      </SimulationManager>
    </ErrorBoundary>
  );
} 