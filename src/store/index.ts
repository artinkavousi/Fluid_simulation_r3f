import { create } from 'zustand';

interface FluidState {
  backgroundColor: string;
  currentColor: [number, number, number];
  dt: number;
  viscosity: number;
  density: number;
  pressure: number;
  temperature: number;
  brightness: number;
  contrast: number;
  saturation: number;
  setBackgroundColor: (color: string) => void;
  setCurrentColor: (color: [number, number, number]) => void;
  setDt: (dt: number) => void;
  setViscosity: (viscosity: number) => void;
  setDensity: (density: number) => void;
  setPressure: (pressure: number) => void;
  setTemperature: (temperature: number) => void;
  setBrightness: (brightness: number) => void;
  setContrast: (contrast: number) => void;
  setSaturation: (saturation: number) => void;
}

export const useStore = create<FluidState>((set) => ({
  backgroundColor: '#000000',
  currentColor: [1, 1, 1],
  dt: 1/60,
  viscosity: 1.0,
  density: 1.0,
  pressure: 0.8,
  temperature: 0.0,
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setCurrentColor: (color) => set({ currentColor: color }),
  setDt: (dt) => set({ dt }),
  setViscosity: (viscosity) => set({ viscosity }),
  setDensity: (density) => set({ density }),
  setPressure: (pressure) => set({ pressure }),
  setTemperature: (temperature) => set({ temperature }),
  setBrightness: (brightness) => set({ brightness }),
  setContrast: (contrast) => set({ contrast }),
  setSaturation: (saturation) => set({ saturation })
})); 