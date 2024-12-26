import { FluidParams } from '../store/useStore';

export interface FluidPreset {
  name: string;
  description: string;
  palette?: ColorPalette;
  params: Partial<FluidParams>;
}

export interface ColorPalette {
  name: string;
  description: string;
  colors: [number, number, number][];
} 