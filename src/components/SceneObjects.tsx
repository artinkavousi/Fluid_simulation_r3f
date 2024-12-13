import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { PointEmitter } from './Emitters/PointEmitter';
import { LineEmitter } from './Emitters/LineEmitter';
import { DyeEmitter } from './Emitters/DyeEmitter';
import { BaseEmitter } from './Emitters/BaseEmitter';

export function SceneObjects() {
  const emittersRef = useRef<Map<string, BaseEmitter>>(new Map());
  const emitters = useStore(state => state.emitters);

  useEffect(() => {
    // Clean up removed emitters
    const currentIds = new Set(Object.keys(emitters));
    emittersRef.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        const emitter = emittersRef.current.get(id);
        if (emitter) {
          emitter.dispose();
          emittersRef.current.delete(id);
        }
      }
    });

    // Add or update emitters
    Object.entries(emitters).forEach(([id, props]) => {
      let emitter = emittersRef.current.get(id);
      
      if (!emitter) {
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
        }
        if (emitter) emittersRef.current.set(id, emitter);
      } else {
        emitter.updateProps(props);
      }
    });
  }, [emitters]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    emittersRef.current.forEach(emitter => {
      emitter.update(time);
    });
  });

  return (
    <>
      {Array.from(emittersRef.current.values()).map(emitter => {
        if (emitter instanceof PointEmitter) {
          const mesh = emitter.getMesh();
          return mesh && <primitive key={emitter.getId()} object={mesh} />;
        }
        if (emitter instanceof LineEmitter) {
          const line = emitter.getLine();
          return line && <primitive key={emitter.getId()} object={line} />;
        }
        if (emitter instanceof DyeEmitter) {
          const particles = emitter.getParticles();
          return <primitive key={emitter.getId()} object={particles} />;
        }
        return null;
      })}
    </>
  );
} 