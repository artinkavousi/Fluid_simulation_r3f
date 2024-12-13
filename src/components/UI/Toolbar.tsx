import React from 'react';
import { useStore } from '../../store/useStore';

export function Toolbar() {
  const addEmitter = useStore(state => state.addEmitter);
  const selectedEmitter = useStore(state => state.selectedEmitter);
  const setSelectedEmitter = useStore(state => state.setSelectedEmitter);

  const handleAddEmitter = (type: 'point' | 'line' | 'dye') => {
    const id = `emitter_${Date.now()}`;
    const props = {
      type,
      position: [0, 0],
      color: [1, 1, 1],
      radius: type === 'point' ? 0.1 : undefined,
      start: type === 'line' ? [-1, 0] : undefined,
      end: type === 'line' ? [1, 0] : undefined,
    };
    
    addEmitter(id, props);
    setSelectedEmitter(id);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      display: 'flex',
      gap: '10px',
      background: 'rgba(0,0,0,0.8)',
      padding: '10px',
      borderRadius: '4px'
    }}>
      <button
        onClick={() => handleAddEmitter('point')}
        style={{
          padding: '5px 10px',
          background: '#4CAF50',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Add Point Emitter
      </button>
      
      <button
        onClick={() => handleAddEmitter('line')}
        style={{
          padding: '5px 10px',
          background: '#2196F3',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Add Line Emitter
      </button>
      
      <button
        onClick={() => handleAddEmitter('dye')}
        style={{
          padding: '5px 10px',
          background: '#9C27B0',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Add Dye Emitter
      </button>
    </div>
  );
} 