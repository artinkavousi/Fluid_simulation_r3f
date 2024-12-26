import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { DyeEmitter } from './Emitters/DyeEmitter';
import { LineEmitter } from './Emitters/LineEmitter';
import { PointEmitter } from './Emitters/PointEmitter';
import { BaseEmitter } from './Emitters/BaseEmitter';

export function SceneObjects() {
  const emitters = useStore(state => state.emitters);
  const emittersRef = useRef<BaseEmitter[]>([]);

  useEffect(() => {
    // Clean up old emitters
    emittersRef.current.forEach(emitter => emitter.dispose());
    emittersRef.current = [];

    // Create new emitters
    emitters.forEach((props, index) => {
      let emitter: BaseEmitter;
      const id = `emitter_${index}`;

      switch (props.type) {
        case 'point':
          emitter = new PointEmitter(id, props);
          break;
        case 'line':
          emitter = new LineEmitter(id, props);
          break;
        case 'dye':
          emitter = new DyeEmitter(id, props);
          break;
        default:
          return;
      }

      emittersRef.current.push(emitter);
    });

    return () => {
      emittersRef.current.forEach(emitter => emitter.dispose());
    };
  }, [emitters]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    emittersRef.current.forEach(emitter => emitter.update(time));
  });

  return null;
} 