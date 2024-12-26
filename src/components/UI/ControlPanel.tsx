import { useControls, folder } from 'leva';
import { useStore } from '../../store/useStore';

export function ControlPanel() {
  const store = useStore();

  useControls({
    'Fluid Dynamics': folder({
      dt: {
        value: store.dt,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        onChange: (value) => useStore.setState({ dt: value })
      },
      pressureIterations: {
        value: store.pressureIterations,
        min: 1,
        max: 50,
        step: 1,
        onChange: (value) => useStore.setState({ pressureIterations: value })
      },
      curlStrength: {
        value: store.curlStrength,
        min: 0,
        max: 50,
        step: 1,
        onChange: (value) => useStore.setState({ curlStrength: value })
      },
      viscosity: {
        value: store.viscosity || 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ viscosity: value })
      },
      vorticityScale: {
        value: store.vorticityScale || 1.0,
        min: 0,
        max: 2,
        step: 0.1,
        onChange: (value) => useStore.setState({ vorticityScale: value })
      }
    }),
    'Visual Effects': folder({
      colorIntensity: {
        value: store.colorIntensity || 1.0,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        onChange: (value) => useStore.setState({ colorIntensity: value })
      },
      colorMixing: {
        value: store.colorMixing || 0.2,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ colorMixing: value })
      },
      rainbowEffect: {
        value: store.rainbowEffect || 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ rainbowEffect: value })
      },
      bloomStrength: {
        value: store.bloomStrength || 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ bloomStrength: value })
      }
    }),
    'Advanced Effects': folder({
      chromaticAberration: {
        value: store.chromaticAberration || 0.0,
        min: 0,
        max: 0.05,
        step: 0.001,
        onChange: (value) => useStore.setState({ chromaticAberration: value })
      },
      motionBlurStrength: {
        value: store.motionBlurStrength || 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ motionBlurStrength: value })
      },
      kaleidoscopeSegments: {
        value: store.kaleidoscopeSegments || 0,
        min: 0,
        max: 12,
        step: 1,
        onChange: (value) => useStore.setState({ kaleidoscopeSegments: value })
      },
      kaleidoscopeRotation: {
        value: store.kaleidoscopeRotation || 0,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        onChange: (value) => useStore.setState({ kaleidoscopeRotation: value })
      }
    }),
    'Distortion Effects': folder({
      distortionStrength: {
        value: store.distortionStrength || 0.0,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ distortionStrength: value })
      },
      noiseScale: {
        value: store.noiseScale || 0.0,
        min: 0,
        max: 10,
        step: 0.1,
        onChange: (value) => useStore.setState({ noiseScale: value })
      },
      pulseSpeed: {
        value: store.pulseSpeed || 0.0,
        min: 0,
        max: 5,
        step: 0.1,
        onChange: (value) => useStore.setState({ pulseSpeed: value })
      },
      waveAmplitude: {
        value: store.waveAmplitude || 0.0,
        min: 0,
        max: 0.1,
        step: 0.001,
        onChange: (value) => useStore.setState({ waveAmplitude: value })
      }
    }),
    'Audio Reactivity': folder({
      audioReactivity: {
        value: store.audioReactivity || 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ audioReactivity: value })
      }
    }),
    'Temperature & Buoyancy': folder({
      temperature: {
        value: store.temperature || 0.3,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => useStore.setState({ temperature: value })
      },
      buoyancy: {
        value: store.buoyancy || 1.0,
        min: 0,
        max: 2,
        step: 0.1,
        onChange: (value) => useStore.setState({ buoyancy: value })
      },
      density: {
        value: store.density || 0.98,
        min: 0.9,
        max: 1.1,
        step: 0.01,
        onChange: (value) => useStore.setState({ density: value })
      }
    }),
    'Dissipation & Diffusion': folder({
      velocityDissipation: {
        value: store.velocityDissipation || 0.98,
        min: 0.9,
        max: 1.0,
        step: 0.001,
        onChange: (value) => useStore.setState({ velocityDissipation: value })
      },
      temperatureDissipation: {
        value: store.temperatureDissipation || 0.95,
        min: 0.9,
        max: 1.0,
        step: 0.001,
        onChange: (value) => useStore.setState({ temperatureDissipation: value })
      },
      pressureDissipation: {
        value: store.pressureDissipation || 0.95,
        min: 0.9,
        max: 1.0,
        step: 0.001,
        onChange: (value) => useStore.setState({ pressureDissipation: value })
      },
      colorDiffusion: {
        value: store.colorDiffusion || 0.995,
        min: 0.9,
        max: 1.0,
        step: 0.001,
        onChange: (value) => useStore.setState({ colorDiffusion: value })
      }
    }),
    'Display': folder({
      renderMode: {
        value: store.renderMode,
        options: {
          'Dye': 'dye',
          'Velocity': 'velocity',
          'Pressure': 'pressure',
          'Temperature': 'temperature',
          'Rainbow': 'rainbow',
          'Kaleidoscope': 'kaleidoscope'
        },
        onChange: (value) => useStore.setState({ renderMode: value })
      },
      backgroundColor: {
        value: { r: store.backgroundColor[0], g: store.backgroundColor[1], b: store.backgroundColor[2] },
        onChange: ({ r, g, b }) => useStore.setState({ backgroundColor: [r, g, b] })
      }
    })
  });

  return null;
} 