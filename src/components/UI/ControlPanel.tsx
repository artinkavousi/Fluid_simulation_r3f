import React from 'react';
import { useControls, folder } from 'leva';
import { useStore } from '../../store/useStore';

export function ControlPanel() {
  const store = useStore();

  const simulationControls = useControls({
    Simulation: folder({
      resolution: {
        value: store.resolution,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        onChange: (value) => store.resolution = value
      },
      dt: {
        value: store.dt,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        onChange: (value) => store.dt = value
      },
      dyeDecay: {
        value: store.dyeDecay,
        min: 0.9,
        max: 1.0,
        step: 0.001,
        onChange: (value) => store.dyeDecay = value
      },
      pressureIterations: {
        value: store.pressureIterations,
        min: 1,
        max: 50,
        step: 1,
        onChange: (value) => store.pressureIterations = value
      },
      curlStrength: {
        value: store.curlStrength,
        min: 0,
        max: 50,
        step: 1,
        onChange: (value) => store.curlStrength = value
      }
    }),
    Display: folder({
      renderMode: {
        value: store.renderMode,
        options: ['dye', 'velocity', 'pressure'],
        onChange: (value) => store.renderMode = value
      },
      backgroundColor: {
        value: { r: store.backgroundColor[0], g: store.backgroundColor[1], b: store.backgroundColor[2] },
        onChange: ({ r, g, b }) => store.backgroundColor = [r, g, b]
      }
    })
  });

  return null; // Leva creates its own UI
} 