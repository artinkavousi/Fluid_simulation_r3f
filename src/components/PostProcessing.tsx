import { useStore } from '../store/useStore';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { Vector2 } from 'three';
import { BlendFunction } from 'postprocessing';

export function PostProcessing() {
  const {
    bloomStrength,
    chromaticAberration
  } = useStore();

  const effects = [];

  if (bloomStrength > 0) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={bloomStrength}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        height={300}
        blendFunction={BlendFunction.ADD}
      />
    );
  }

  if (chromaticAberration > 0) {
    effects.push(
      <ChromaticAberration
        key="chromatic"
        offset={new Vector2(chromaticAberration * 0.001, chromaticAberration * 0.001)}
        blendFunction={BlendFunction.NORMAL}
        modulationOffset={0}
        radialModulation={false}
      />
    );
  }

  return <EffectComposer>{effects}</EffectComposer>;
} 