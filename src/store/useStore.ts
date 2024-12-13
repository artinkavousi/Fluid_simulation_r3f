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
  renderMode: 'dye'|'velocity'|'pressure';

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
}

export const useStore = create<AppState>((set,get) => ({
  resolution: 1.0,
  dt: 0.016,
  dyeDecay: 0.98,
  pressureIterations: 20,
  curlStrength: 30,
  renderMode: 'dye',

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
})); 