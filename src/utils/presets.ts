import { FluidPreset, ColorPalette } from '../types/presets';

export const colorPalettes: ColorPalette[] = [
  {
    name: "Neon Dreams",
    colors: [
      [1.0, 0.2, 0.8],  // Hot pink
      [0.2, 0.8, 1.0],  // Cyan
      [0.8, 0.3, 1.0],  // Purple
      [1.0, 0.8, 0.2]   // Yellow
    ],
    description: "Vibrant neon colors that create a cyberpunk atmosphere"
  },
  {
    name: "Ocean Depths",
    colors: [
      [0.0, 0.4, 0.8],  // Deep blue
      [0.0, 0.8, 0.6],  // Turquoise
      [0.1, 0.2, 0.4],  // Dark blue
      [0.4, 0.8, 1.0]   // Light blue
    ],
    description: "Deep sea colors with bioluminescent accents"
  },
  {
    name: "Aurora Borealis",
    colors: [
      [0.1, 0.8, 0.4],  // Green
      [0.0, 0.6, 0.8],  // Blue
      [0.8, 0.3, 0.8],  // Purple
      [0.2, 1.0, 0.5]   // Bright green
    ],
    description: "Northern lights inspired ethereal colors"
  },
  {
    name: "Sunset Blaze",
    colors: [
      [1.0, 0.2, 0.1],  // Red
      [1.0, 0.5, 0.0],  // Orange
      [0.8, 0.0, 0.3],  // Dark red
      [1.0, 0.8, 0.0]   // Yellow
    ],
    description: "Warm sunset colors with fiery accents"
  },
  {
    name: "Mystic Forest",
    colors: [
      [0.2, 0.6, 0.3],  // Forest green
      [0.4, 0.8, 0.2],  // Bright green
      [0.8, 0.9, 0.3],  // Yellow-green
      [0.1, 0.4, 0.2]   // Dark green
    ],
    description: "Enchanted forest colors with magical highlights"
  }
]; 

export const fluidPresets: FluidPreset[] = [
  {
    name: "Ethereal Flow",
    description: "Smooth, ethereal fluid motion with subtle color transitions",
    palette: colorPalettes[2], // Aurora Borealis
    params: {
      dt: 0.016,
      pressureIterations: 20,
      curlStrength: 25,
      viscosity: 0.4,
      temperature: 0.3,
      buoyancy: 0.8,
      density: 0.98,
      diffusion: 0.1,
      velocityDissipation: 0.98,
      temperatureDissipation: 0.95,
      pressureDissipation: 0.95,
      colorDiffusion: 0.995,
      audioReactivity: 0.6,
      vorticityScale: 1.2,
      colorIntensity: 1.2,
      colorMixing: 0.3,
      rainbowEffect: 0.1,
      bloomStrength: 0.4,
      chromaticAberration: 0.02,
      motionBlurStrength: 0.3,
      kaleidoscopeSegments: 0,
      kaleidoscopeRotation: 0,
      distortionStrength: 0.1,
      noiseScale: 2.0,
      pulseSpeed: 0.5,
      waveAmplitude: 0.02,
      useCurrentPalette: false
    }
  },
  {
    name: "Deep Sea",
    description: "Dark and mysterious underwater currents",
    palette: colorPalettes[1], // Ocean Depths
    params: {
      dt: 0.016,
      pressureIterations: 25,
      curlStrength: 35,
      viscosity: 0.6,
      temperature: 0.2,
      buoyancy: 1.2,
      density: 1.0,
      diffusion: 0.15,
      velocityDissipation: 0.97,
      temperatureDissipation: 0.93,
      pressureDissipation: 0.94,
      colorDiffusion: 0.99,
      audioReactivity: 0.4,
      vorticityScale: 1.5,
      colorIntensity: 0.9,
      colorMixing: 0.4,
      rainbowEffect: 0.0,
      bloomStrength: 0.3,
      chromaticAberration: 0.03,
      motionBlurStrength: 0.4,
      kaleidoscopeSegments: 0,
      kaleidoscopeRotation: 0,
      distortionStrength: 0.15,
      noiseScale: 3.0,
      pulseSpeed: 0.3,
      waveAmplitude: 0.03,
      useCurrentPalette: false
    }
  },
  {
    name: "Solar Flares",
    description: "Dynamic, energetic fluid motion with intense colors",
    palette: colorPalettes[3], // Sunset Blaze
    params: {
      dt: 0.016,
      pressureIterations: 30,
      curlStrength: 45,
      viscosity: 0.3,
      temperature: 0.5,
      buoyancy: 1.5,
      density: 0.95,
      diffusion: 0.08,
      velocityDissipation: 0.99,
      temperatureDissipation: 0.97,
      pressureDissipation: 0.96,
      colorDiffusion: 0.998,
      audioReactivity: 0.7,
      vorticityScale: 1.8,
      colorIntensity: 1.4,
      colorMixing: 0.5,
      rainbowEffect: 0.2,
      bloomStrength: 0.6,
      chromaticAberration: 0.025,
      motionBlurStrength: 0.25,
      kaleidoscopeSegments: 0,
      kaleidoscopeRotation: 0,
      distortionStrength: 0.2,
      noiseScale: 4.0,
      pulseSpeed: 0.8,
      waveAmplitude: 0.025,
      useCurrentPalette: false
    }
  },
  {
    name: "Aurora",
    description: "Gentle, flowing aurora-like patterns",
    palette: colorPalettes[2], // Aurora Borealis
    params: {
      dt: 0.016,
      pressureIterations: 22,
      curlStrength: 28,
      viscosity: 0.5,
      temperature: 0.25,
      buoyancy: 0.9,
      density: 0.97,
      diffusion: 0.12,
      velocityDissipation: 0.975,
      temperatureDissipation: 0.94,
      pressureDissipation: 0.95,
      colorDiffusion: 0.997,
      audioReactivity: 0.5,
      vorticityScale: 1.3,
      colorIntensity: 1.1,
      colorMixing: 0.35,
      rainbowEffect: 0.15,
      bloomStrength: 0.5,
      chromaticAberration: 0.015,
      motionBlurStrength: 0.35,
      kaleidoscopeSegments: 0,
      kaleidoscopeRotation: 0,
      distortionStrength: 0.12,
      noiseScale: 2.5,
      pulseSpeed: 0.4,
      waveAmplitude: 0.015,
      useCurrentPalette: false
    }
  },
  {
    name: "Psychedelic",
    description: "Intense, colorful patterns with kaleidoscopic effects",
    palette: colorPalettes[0], // Neon Dreams
    params: {
      dt: 0.016,
      pressureIterations: 25,
      curlStrength: 40,
      viscosity: 0.3,
      temperature: 0.4,
      buoyancy: 1.3,
      density: 0.96,
      diffusion: 0.09,
      velocityDissipation: 0.985,
      temperatureDissipation: 0.96,
      pressureDissipation: 0.96,
      colorDiffusion: 0.999,
      audioReactivity: 0.8,
      vorticityScale: 1.6,
      colorIntensity: 1.5,
      colorMixing: 0.6,
      rainbowEffect: 0.3,
      bloomStrength: 0.7,
      chromaticAberration: 0.035,
      motionBlurStrength: 0.2,
      kaleidoscopeSegments: 6,
      kaleidoscopeRotation: Math.PI / 4,
      distortionStrength: 0.25,
      noiseScale: 5.0,
      pulseSpeed: 1.0,
      waveAmplitude: 0.035,
      useCurrentPalette: false
    }
  },
  {
    name: "Forest Magic",
    description: "Mystical forest-inspired fluid patterns",
    palette: colorPalettes[4], // Mystic Forest
    params: {
      dt: 0.016,
      pressureIterations: 23,
      curlStrength: 32,
      viscosity: 0.45,
      temperature: 0.35,
      buoyancy: 1.1,
      density: 0.98,
      diffusion: 0.11,
      velocityDissipation: 0.978,
      temperatureDissipation: 0.95,
      pressureDissipation: 0.95,
      colorDiffusion: 0.996,
      audioReactivity: 0.55,
      vorticityScale: 1.4,
      colorIntensity: 1.0,
      colorMixing: 0.45,
      rainbowEffect: 0.05,
      bloomStrength: 0.45,
      chromaticAberration: 0.018,
      motionBlurStrength: 0.3,
      kaleidoscopeSegments: 0,
      kaleidoscopeRotation: 0,
      distortionStrength: 0.14,
      noiseScale: 2.8,
      pulseSpeed: 0.6,
      waveAmplitude: 0.022,
      useCurrentPalette: false
    }
  }
]; 