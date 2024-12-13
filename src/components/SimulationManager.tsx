import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { AudioEQ } from './UI/AudioEQ';
import { FluidSolver } from '../utils/FluidSolver';

interface Props {
  children: React.ReactNode;
}

export function SimulationManager({ children }: Props) {
  const setAudioData = useStore(state => state.setAudioData);
  const fluidSolver = useStore(state => state.fluidSolver);
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
            analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
            setAudioData(dataArrayRef.current);
            
            // Update fluid solver with audio data
            if (fluidSolver) {
              fluidSolver.setAudioData(dataArrayRef.current);
            }
          }
          animationFrameRef.current = requestAnimationFrame(updateData);
        };

        updateData();

        // Try to get audio input
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyzerRef.current);
        } catch (err) {
          console.log('No audio input available, using simulated data');
          // Continue with simulated data if no microphone access
        }
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
  }, [setAudioData, fluidSolver]);

  return (
    <>
      {children}
      <AudioEQ />
    </>
  );
} 