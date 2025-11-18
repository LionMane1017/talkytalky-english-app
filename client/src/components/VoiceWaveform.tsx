import React from 'react';

interface VoiceWaveformProps {
  audioLevel: number;
  isActive: boolean;
  isSpeaking?: boolean;
}

export function VoiceWaveform({ audioLevel, isActive, isSpeaking = false }: VoiceWaveformProps) {
  const bars = 20;
  const barHeights = Array.from({ length: bars }, (_, i) => {
    // Create wave pattern based on audio level
    const baseHeight = isActive ? 20 + audioLevel * 60 : 10;
    const wave = Math.sin((i / bars) * Math.PI * 2 + Date.now() / 200) * 15;
    return Math.max(10, baseHeight + wave);
  });

  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {barHeights.map((height, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            isSpeaking 
              ? 'bg-gradient-to-t from-purple-600 to-pink-500 shadow-lg shadow-purple-500/50' 
              : 'bg-gradient-to-t from-purple-400 to-purple-600'
          }`}
          style={{
            height: `${height}%`,
            opacity: isActive ? 0.8 + audioLevel * 0.2 : 0.3,
            transform: isActive ? `scaleY(${0.8 + audioLevel * 0.4})` : 'scaleY(0.5)',
          }}
        />
      ))}
    </div>
  );
}

export function GlobalStatusIndicator({ status }: { status: 'idle' | 'listening' | 'speaking' | 'thinking' }) {
  const statusConfig = {
    idle: { color: 'bg-gray-500', text: 'Offline', pulse: false },
    listening: { color: 'bg-blue-500', text: 'Listening', pulse: true },
    speaking: { color: 'bg-purple-500', text: 'Speaking', pulse: true },
    thinking: { color: 'bg-yellow-500', text: 'Thinking', pulse: true },
  };

  const config = statusConfig[status];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700 shadow-lg">
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>
      <span className="text-sm font-medium text-white">{config.text}</span>
    </div>
  );
}
