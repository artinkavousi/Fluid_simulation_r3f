import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { TimelineKeyframe } from '../../store/useStore';

export function TimelineEditor() {
  const selectedEmitter = useStore(state => state.selectedEmitter);
  const addKeyframe = useStore(state => state.addKeyframe);
  const timeline = useStore(state => state.timeline);
  const [currentTime, setCurrentTime] = useState(0);

  const handleAddKeyframe = () => {
    if (selectedEmitter === null) return;

    const keyframe: TimelineKeyframe = {
      time: currentTime,
      emitterId: selectedEmitter,
      properties: {
        position: [0, 0],
        color: [1, 1, 1],
        strength: 1
      }
    };

    addKeyframe(keyframe);
  };

  return (
    <div className="timeline-editor">
      <div className="timeline-controls">
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
        />
        <button onClick={handleAddKeyframe} disabled={selectedEmitter === null}>
          Add Keyframe
        </button>
      </div>
      <div className="timeline-keyframes">
        {timeline.map((kf, index) => (
          <div key={index} className="keyframe">
            {kf.emitterId} - {kf.time.toFixed(2)}s
          </div>
        ))}
      </div>
    </div>
  );
} 