import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
// Fix: Removed import for `LiveSession` as it is not an exported member of `@google/genai`.
import { TALKYTALKY_SYSTEM_PROMPT } from '../constants';
import { AppStatus } from '../types';
import type { Message } from '../types';
import { decode, encode, decodeAudioData } from '../utils/audio';
import { MicrophoneIcon, StopIcon } from '../components/Icons';

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [transcripts, setTranscripts] = useState<Message[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  // Fix: Replaced `LiveSession` with `any` as it is not an exported type.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanUpAudio = useCallback(() => {
    // Disconnect Web Audio API nodes
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (audioProcessorNodeRef.current) {
        audioProcessorNodeRef.current.disconnect();
        audioProcessorNodeRef.current = null;
    }
    if(analyserNodeRef.current){
        analyserNodeRef.current.disconnect();
        analyserNodeRef.current = null;
    }

    // Stop microphone stream tracks
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    // Close AudioContexts
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Stop and clear any playing audio sources
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextAudioStartTimeRef.current = 0;
    
    setAudioLevel(0);
  }, []);

  const stopSession = useCallback(async () => {
    setStatus(AppStatus.IDLE);
    
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    
    cleanUpAudio();
    console.log('Session stopped and resources cleaned up.');
  }, [cleanUpAudio]);


  const startSession = useCallback(async () => {
    setStatus(AppStatus.CONNECTING);
    setTranscripts([]);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            console.log('Session opened.');
            setStatus(AppStatus.CONNECTED);
            
            // Start streaming microphone audio
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
            
            analyserNodeRef.current = inputAudioContextRef.current!.createAnalyser();
            analyserNodeRef.current.fftSize = 256;

            audioProcessorNodeRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            audioProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: GenAIBlob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              if(sessionPromiseRef.current) {
                // Fix: Removed `session.isOpen()` check as it's not a supported method.
                // Data should be sent once the session promise resolves.
                sessionPromiseRef.current.then((session) => {
                   session.sendRealtimeInput({ media: pcmBlob });
                });
              }

              const dataArray = new Uint8Array(analyserNodeRef.current!.frequencyBinCount);
              analyserNodeRef.current!.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setAudioLevel(average / 255);
            };

            mediaStreamSourceRef.current.connect(analyserNodeRef.current);
            mediaStreamSourceRef.current.connect(audioProcessorNodeRef.current);
            audioProcessorNodeRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userInput = currentInputTranscriptionRef.current.trim();
              const modelOutput = currentOutputTranscriptionRef.current.trim();
              
              if(userInput) setTranscripts(prev => [...prev, { role: 'user', text: userInput }]);
              if(modelOutput) setTranscripts(prev => [...prev, { role: 'model', text: modelOutput }]);

              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
              const source = outputAudioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContextRef.current.destination);
              
              const currentTime = outputAudioContextRef.current.currentTime;
              const startTime = Math.max(currentTime, nextAudioStartTimeRef.current);

              source.start(startTime);
              nextAudioStartTimeRef.current = startTime + audioBuffer.duration;

              audioSourcesRef.current.add(source);
              source.onended = () => {
                audioSourcesRef.current.delete(source);
              };
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(source => source.stop());
              audioSourcesRef.current.clear();
              nextAudioStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus(AppStatus.IDLE);
            cleanUpAudio();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.');
            if (status !== AppStatus.IDLE) {
              setStatus(AppStatus.IDLE);
              cleanUpAudio();
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: { parts: [{ text: TALKYTALKY_SYSTEM_PROMPT }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus(AppStatus.IDLE);
      alert(`Error starting session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      cleanUpAudio();
    }
  }, [status, cleanUpAudio]);

  const getButtonState = () => {
    switch (status) {
      case AppStatus.IDLE:
        return { text: 'Start Live Chat', action: startSession, icon: <MicrophoneIcon />, disabled: false, animate: false };
      case AppStatus.CONNECTING:
        return { text: 'Connecting...', action: () => {}, icon: <MicrophoneIcon />, disabled: true, animate: true };
      case AppStatus.CONNECTED:
        return { text: 'End Chat', action: stopSession, icon: <StopIcon />, disabled: false, animate: true };
      default:
        return { text: 'Start Live Chat', action: startSession, icon: <MicrophoneIcon />, disabled: true, animate: false };
    }
  };

  const { text, action, icon, disabled, animate } = getButtonState();

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans overflow-hidden">
      <header className="p-4 border-b border-gray-700 shadow-lg bg-gray-900/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          TalkyTalky AI English Coach
        </h1>
        <p className="text-center text-gray-400 text-sm">Real-time pronunciation and fluency practice</p>
      </header>
      
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        <div className="flex-1 space-y-4 pb-24 md:pb-32">
          {transcripts.map((msg, i) => (
             <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                 <p className="text-sm">{msg.text}</p>
               </div>
             </div>
          ))}
           {transcripts.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MicrophoneIcon className="w-16 h-16 mb-4"/>
                <p className="text-lg">Click "Start Live Chat" to begin.</p>
             </div>
           )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
            {animate && (
              <div 
                className="absolute w-28 h-28 rounded-full bg-purple-500/50 transition-transform duration-300" 
                style={{ transform: `scale(${0.5 + audioLevel * 1.5})` }}
              />
            )}
            <button
              onClick={action}
              disabled={disabled}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                status === AppStatus.CONNECTED ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
              } ${animate ? 'animate-pulse' : ''}`}
            >
              {icon}
            </button>
        </div>
        <p className="text-sm text-gray-400 mt-3">{text}</p>
      </footer>
    </div>
  );
}