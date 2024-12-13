import React, { useMemo } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Effect } from '@react-three/postprocessing';
import { BlendFunction, Effect as PostEffect } from 'postprocessing';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

// Custom motion blur effect
class CustomMotionBlurEffect extends PostEffect {
  constructor({ blendFunction = BlendFunction.NORMAL, opacity = 1.0 }) {
    super('CustomMotionBlurEffect', `
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float opacity;
      uniform sampler2D velocityTexture;
      
      varying vec2 vUv;
      
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec4 color = inputColor;
        vec2 vel = texture2D(velocityTexture, uv).xy;
        float speed = length(vel);
        
        if (speed > 0.0) {
          vec2 offset = normalize(vel) * 0.005;
          for(float i = 0.0; i < 8.0; i++) {
            vec2 sampleUv = uv - offset * i;
            color += texture2D(tDiffuse, sampleUv);
          }
          color /= 9.0;
        }
        
        outputColor = mix(inputColor, color, opacity);
      }
    `, {
      blendFunction,
      uniforms: new Map([
        ['opacity', new THREE.Uniform(opacity)],
        ['resolution', new THREE.Uniform(new THREE.Vector2(1, 1))],
        ['velocityTexture', new THREE.Uniform(null)]
      ])
    });
  }

  update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    const velocityTexture = useStore.getState().velocityTexture;
    if (velocityTexture) {
      this.uniforms.get('velocityTexture').value = velocityTexture;
    }
  }
}

// Custom motion blur effect wrapper
const MotionBlur = ({ opacity = 1.0, blendFunction = BlendFunction.NORMAL }) => {
  const effect = useMemo(() => new CustomMotionBlurEffect({ opacity, blendFunction }), [opacity, blendFunction]);
  return <primitive object={effect} />;
};

export function PostProcessing() {
  const {
    bloomStrength,
    chromaticAberration,
    motionBlurStrength
  } = useStore(state => ({
    bloomStrength: state.bloomStrength || 0.5,
    chromaticAberration: state.chromaticAberration || 0.0,
    motionBlurStrength: state.motionBlurStrength || 0.0
  }));

  return (
    <EffectComposer>
      {bloomStrength > 0 && (
        <Bloom
          intensity={bloomStrength}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.SCREEN}
        />
      )}
      {chromaticAberration > 0 && (
        <ChromaticAberration
          offset={[chromaticAberration * 0.001, chromaticAberration * 0.001]}
          blendFunction={BlendFunction.NORMAL}
          opacity={1.0}
        />
      )}
      {motionBlurStrength > 0 && (
        <MotionBlur
          blendFunction={BlendFunction.NORMAL}
          opacity={motionBlurStrength}
        />
      )}
    </EffectComposer>
  );
} 