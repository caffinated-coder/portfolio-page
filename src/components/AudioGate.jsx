import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioGate({ onEnter }) {
  const [loading, setLoading] = useState(false);

  const handleStartAudio = async (enableAudio) => {
    setLoading(true);

    // Initialize global audioData structure
    window.audioData = {
      bass: 0,
      treble: 0,
      volume: 0,
      isPlaying: false,
      dataArray: new Uint8Array(0),
    };

    if (enableAudio) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        // Load loop
        const audio = new Audio('/music.mp3');
        audio.loop = true;
        audio.crossOrigin = 'anonymous';

        // Set up Web Audio pipeline
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128; // 64 frequency bins
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Lowpass filter to smooth low-end reactivity
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        source.connect(filter);
        filter.connect(analyser);
        analyser.connect(ctx.destination);

        await ctx.resume();
        await audio.play();

        window.audioContext = ctx;
        window.audioElement = audio;
        window.audioAnalyser = analyser;
        window.audioData.isPlaying = true;

        // Start 60fps analysis loop
        const analyze = () => {
          if (!window.audioData.isPlaying) return;
          analyser.getByteFrequencyData(dataArray);

          // Bass frequency range: first 6 bins (low end)
          let bassSum = 0;
          const bassBins = Math.min(6, bufferLength);
          for (let i = 0; i < bassBins; i++) {
            bassSum += dataArray[i];
          }
          const bassAvg = bassSum / bassBins;

          // Treble frequency range: mid to high bins
          let trebleSum = 0;
          const trebleStart = Math.floor(bufferLength * 0.4);
          const trebleEnd = Math.floor(bufferLength * 0.85);
          let count = 0;
          for (let i = trebleStart; i < trebleEnd; i++) {
            trebleSum += dataArray[i];
            count++;
          }
          const trebleAvg = count > 0 ? trebleSum / count : 0;

          // Total volume average
          let volSum = 0;
          for (let i = 0; i < bufferLength; i++) {
            volSum += dataArray[i];
          }
          const volAvg = volSum / bufferLength;

          // Store normalized values in window.audioData
          // We normalize from 0-255 to 0-1 range
          window.audioData.bass = bassAvg / 255;
          window.audioData.treble = trebleAvg / 255;
          window.audioData.volume = volAvg / 255;
          window.audioData.dataArray = dataArray;

          requestAnimationFrame(analyze);
        };

        analyze();
      } catch (err) {
        console.warn('Audio playback failed or was blocked:', err);
      }
    }

    onEnter();
  };

  return (
    <div className="audio-gate-container">
      <div className="audio-gate-card">
        <h1 className="gate-title">SANJAY SARMAH</h1>
        <p className="gate-subtitle">GEOPOLITICAL RISK & POLICY RESEARCH</p>
        
        <div className="gate-divider" />
        
        <p className="gate-instruction">
          This portfolio is a reactive audio-visual experience. Turn on sound to enable dynamic 3D physics, real-time shaders, and hover chimes.
        </p>

        <div className="gate-btn-group">
          <button 
            onClick={() => handleStartAudio(true)} 
            disabled={loading}
            className="gate-btn enter-sound"
          >
            <Volume2 size={20} />
            <span>ENTER WITH AUDIO</span>
          </button>
          
          <button 
            onClick={() => handleStartAudio(false)} 
            disabled={loading}
            className="gate-btn enter-silent"
          >
            <VolumeX size={20} />
            <span>ENTER SILENT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
