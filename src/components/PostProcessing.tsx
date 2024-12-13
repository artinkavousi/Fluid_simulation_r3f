import React from 'react';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.0}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.SCREEN}
      />
      <ChromaticAberration
        offset={[0.002, 0.002]}
        blendFunction={BlendFunction.NORMAL}
        opacity={0.3}
      />
    </EffectComposer>
  );
} 