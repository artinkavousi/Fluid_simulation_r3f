import { create } from 'zustand';
import { FluidSolver } from '../utils/FluidSolver';
import { ColorPalette } from '../types/presets';

export interface EmitterProps {
  type: 'point' | 'line' | 'dye';
  position: [number, number];
  color: [number, number, number];
  strength: number;
  radius: number;
  start?: [number, number];  // For line emitter
  end?: [number, number];    // For line emitter
  id?: string;              // For emitter identification
  palette?: ColorPalette;   // For color variations
}

export interface FluidParams {
  dt: number;
  dyeDecay: number;
  pressureIterations: number;
  curlStrength: number;
  viscosity: number;
  temperature: number;
  buoyancy: number;
  density: number;
  diffusion: number;
  velocityDissipation: number;
  temperatureDissipation: number;
  pressureDissipation: number;
  colorDiffusion: number;
  audioReactivity: number;
  vorticityScale: number;
  colorIntensity: number;
  colorMixing: number;
  rainbowEffect: number;
  bloomStrength: number;
  chromaticAberration: number;
  motionBlurStrength: number;
  kaleidoscopeSegments: number;
  kaleidoscopeRotation: number;
  distortionStrength: number;
  noiseScale: number;
  pulseSpeed: number;
  waveAmplitude: number;
  pressure: number;
  useCurrentPalette?: boolean;
  updateParams?: (params: Partial<FluidParams>) => void;
}

export interface TimelineKeyframe {
  time: number;
  properties: Partial<EmitterProps>;
  emitterId: number | string;  // ID of the emitter this keyframe affects
}

interface AppState extends FluidParams {
  backgroundColor: [number, number, number];
  mousePos: [number, number];
  setMousePos: (pos: [number, number]) => void;
  renderMode: 'dye' | 'velocity' | 'pressure' | 'temperature';
  setRenderMode: (mode: 'dye' | 'velocity' | 'pressure' | 'temperature') => void;
  audioData: Uint8Array | null;
  setAudioData: (data: Uint8Array | null) => void;
  fluidSolver: FluidSolver | null;
  emitters: EmitterProps[];
  selectedEmitter: number | null;
  timeline: TimelineKeyframe[];
  addEmitter: (emitter: EmitterProps) => void;
  setSelectedEmitter: (index: number | null) => void;
  addKeyframe: (keyframe: TimelineKeyframe) => void;
}

export const useStore = create<AppState>((set) => ({
  // Simulation parameters
  dt: 0.016,
  dyeDecay: 0.98,
  pressureIterations: 20,
  curlStrength: 30,
  viscosity: 0.5,
  temperature: 0.3,
  buoyancy: 1.0,
  density: 0.98,
  diffusion: 0.1,
  velocityDissipation: 0.98,
  temperatureDissipation: 0.95,
  pressureDissipation: 0.95,
  colorDiffusion: 0.995,
  audioReactivity: 0.5,
  vorticityScale: 1.0,
  colorIntensity: 1.0,
  colorMixing: 0.2,
  rainbowEffect: 0.0,
  bloomStrength: 0.5,
  chromaticAberration: 0.0,
  motionBlurStrength: 0.0,
  kaleidoscopeSegments: 0,
  kaleidoscopeRotation: 0.0,
  distortionStrength: 0.0,
  noiseScale: 1.0,
  pulseSpeed: 1.0,
  waveAmplitude: 0.0,
  pressure: 0.0,

  // Display settings
  backgroundColor: [0, 0, 0],
  mousePos: [0, 0],
  setMousePos: (pos) => set({ mousePos: pos }),
  renderMode: 'dye',
  setRenderMode: (mode) => set({ renderMode: mode }),

  // Audio
  audioData: null,
  setAudioData: (data) => set({ audioData: data }),

  // Fluid simulation
  fluidSolver: null,
  emitters: [],
  selectedEmitter: null,
  timeline: [],
  addEmitter: (emitter) => set((state) => ({ emitters: [...state.emitters, emitter] })),
  setSelectedEmitter: (index) => set({ selectedEmitter: index }),
  addKeyframe: (keyframe) => set((state) => ({ timeline: [...state.timeline, keyframe] }))
})); 