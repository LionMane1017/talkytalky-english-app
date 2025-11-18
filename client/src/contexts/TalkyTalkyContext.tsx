import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TalkyTalkyState {
  isActive: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  setIsActive: (active: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setAudioLevel: (level: number) => void;
}

const TalkyTalkyContext = createContext<TalkyTalkyState | undefined>(undefined);

export function TalkyTalkyProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  return (
    <TalkyTalkyContext.Provider
      value={{
        isActive,
        isSpeaking,
        audioLevel,
        setIsActive,
        setIsSpeaking,
        setAudioLevel,
      }}
    >
      {children}
    </TalkyTalkyContext.Provider>
  );
}

export function useTalkyTalky() {
  const context = useContext(TalkyTalkyContext);
  if (context === undefined) {
    throw new Error('useTalkyTalky must be used within a TalkyTalkyProvider');
  }
  return context;
}
