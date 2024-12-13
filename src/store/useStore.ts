import { create } from 'zustand';

export interface EmitterProps {
  type: 'point'|'line'|'dye';
  position?: [number,number];
  radius?: number;
  color?: [number,number,number];
  start?: [number,number];
  end?: [number,number];
}

interface Keyframe {
  time: number;
  emitterId: string;
  property: string;
  value: any;
}

interface AppState {
  resolution: number;
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
  currentPalette: string;

  emitters: Record<string, EmitterProps>;
  addEmitter: (id:string, props:EmitterProps)=>void;
  updateEmitter: (id:string, updates:Partial<EmitterProps>)=>void;
  removeEmitter: (id:string)=>void;

  selectedEmitter: string|null;
  setSelectedEmitter: (id:string|null)=>void;

  audioData: Uint8Array|null;
  setAudioData: (data:Uint8Array|null)=>void;

  timeline: Keyframe[];
  addKeyframe: (kf:Keyframe)=>void;

  backgroundColor: [number,number,number];

  mousePos: [number,number];
  setMousePos: (pos:[number,number])=>void;

  renderMode: 'dye'|'velocity'|'pressure'|'temperature'|'rainbow'|'kaleidoscope';
  fluidSolver: any;

  velocityTexture: THREE.Texture | null;
}

export const useStore = create<AppState>((set,get) => ({
  resolution: 1.0,
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
  currentPalette: 'default',

  emitters: {},
  addEmitter:(id,props)=>set(state=>({emitters:{...state.emitters,[id]:props}})),
  updateEmitter:(id,updates)=>set(state=>({emitters:{...state.emitters,[id]:{...state.emitters[id],...updates}}})),
  removeEmitter:(id)=>set(state=>{
    const newEmit = {...state.emitters};
    delete newEmit[id];
    return {emitters:newEmit};
  }),

  selectedEmitter:null,
  setSelectedEmitter:(id)=>set({selectedEmitter:id}),

  audioData:null,
  setAudioData:(data)=>set({audioData:data}),

  timeline:[],
  addKeyframe:(kf)=>set(state=>({timeline:[...state.timeline,kf]})),

  backgroundColor:[0,0,0],

  mousePos:[0,0],
  setMousePos:(pos)=>set({mousePos:pos}),

  renderMode:'dye',
  fluidSolver: null,

  velocityTexture: null,
})); 