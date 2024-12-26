import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';

export function AudioEQ() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioData = useStore(state => state.audioData);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw frequency bars
    const barWidth = canvas.width / audioData.length;
    const heightScale = canvas.height / 256;

    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < audioData.length; i++) {
      const x = i * barWidth;
      const height = audioData[i] * heightScale;
      ctx.fillRect(x, canvas.height - height, barWidth - 1, height);
    }
  }, [audioData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '4px'
      }}
    />
  );
} 