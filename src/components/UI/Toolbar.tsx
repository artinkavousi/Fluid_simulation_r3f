import { useStore } from '../../store/useStore';
import type { EmitterProps } from '../../store/useStore';

export function Toolbar() {
  const addEmitter = useStore(state => state.addEmitter);
  const setSelectedEmitter = useStore(state => state.setSelectedEmitter);

  const handleAddEmitter = (type: EmitterProps['type']) => {
    const emitter: EmitterProps = {
      type,
      position: [0, 0],
      color: [1, 1, 1],
      strength: 1,
      radius: 0.1,
    };
    
    addEmitter(emitter);
    setSelectedEmitter(0); // Select the first emitter
  };

  return (
    <div className="toolbar">
      <button onClick={() => handleAddEmitter('point')}>Add Point Emitter</button>
      <button onClick={() => handleAddEmitter('line')}>Add Line Emitter</button>
      <button onClick={() => handleAddEmitter('dye')}>Add Dye Emitter</button>
    </div>
  );
} 