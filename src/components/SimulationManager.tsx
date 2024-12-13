import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { AudioEQ } from './UI/AudioEQ';

interface Props {
  children: React.ReactNode;
}

export function SimulationManager({ children }: Props) {
  const setAudioData = useStore(state => state.setAudioData);
  const audioContextRef = useRef<AudioContext>();
  const analyzerRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 64;
        dataArrayRef.current = new Uint8Array(analyzerRef.current.frequencyBinCount);

        // Start the update loop
        const updateData = () => {
          if (analyzerRef.current && dataArrayRef.current) {
            // Simulate audio data
            for (let i = 0; i < dataArrayRef.current.length; i++) {
              dataArrayRef.current[i] = Math.random() * 256;
            }
            setAudioData(dataArrayRef.current);
          }
          animationFrameRef.current = requestAnimationFrame(updateData);
        };

        updateData();
      } catch (error) {
        console.error('Audio setup failed:', error);
      }
    };

    initializeAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <>
      {children}
      <AudioEQ />
    </>
  );
} 