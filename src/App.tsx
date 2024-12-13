import React from 'react';
import { CanvasView } from './components/CanvasView';
import { ControlPanel } from './components/UI/ControlPanel';
import { TimelineEditor } from './components/UI/TimelineEditor';
import { Toolbar } from './components/UI/Toolbar';
import { SimulationManager } from './components/SimulationManager';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background:'#000' }}>
      <ErrorBoundary>
        <SimulationManager>
          <CanvasView />
        </SimulationManager>
        <Toolbar />
        <ControlPanel />
        <TimelineEditor />
      </ErrorBoundary>
    </div>
  );
} 