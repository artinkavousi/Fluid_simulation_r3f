import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export function TimelineEditor() {
  const [currentTime, setCurrentTime] = useState(0);
  const timeline = useStore(state => state.timeline);
  const addKeyframe = useStore(state => state.addKeyframe);
  const selectedEmitter = useStore(state => state.selectedEmitter);

  const handleAddKeyframe = () => {
    if (!selectedEmitter) return;
    
    addKeyframe({
      time: currentTime,
      emitterId: selectedEmitter,
      property: 'position',
      value: [0, 0] // Default position
    });
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        <span>{currentTime.toFixed(2)}s</span>
        <button
          onClick={handleAddKeyframe}
          disabled={!selectedEmitter}
          style={{
            padding: '5px 10px',
            background: selectedEmitter ? '#4CAF50' : '#ccc',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: selectedEmitter ? 'pointer' : 'not-allowed'
          }}
        >
          Add Keyframe
        </button>
      </div>

      <div style={{
        marginTop: '10px',
        display: 'flex',
        gap: '5px',
        overflowX: 'auto'
      }}>
        {timeline.map((kf, index) => (
          <div
            key={index}
            style={{
              background: '#4CAF50',
              padding: '5px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {kf.emitterId} - {kf.time.toFixed(2)}s
          </div>
        ))}
      </div>
    </div>
  );
} 