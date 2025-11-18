/**
 * Global Gemini Live Session Manager
 * Maintains ONE persistent connection for the entire app
 * TalkyTalky stays live and guides users through all pages
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TALKY_TALKY_SYSTEM_PROMPT } from "../constants/talkyTalky";

class GeminiLiveSessionManager {
  private session: any | null = null;
  private isConnected = false;
  private apiKey: string | null = null;
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private currentContext: string = "";
  
  // Callbacks
  private onAudioCallback: ((audio: AudioBuffer) => void) | null = null;
  private onTextCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  async initialize(apiKey: string) {
    if (this.isConnected) {
      console.log("✅ Already connected to Gemini Live");
      return;
    }

    this.apiKey = apiKey;
    this.audioContext = new AudioContext({ sampleRate: 24000 });

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      this.session = await model.startChat({
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
        },
        systemInstruction: TALKY_TALKY_SYSTEM_PROMPT,
      });

      this.isConnected = true;
      console.log("🎤 TalkyTalky is now LIVE!");
      
      // Start listening for responses
      this.listenForResponses();
    } catch (error) {
      console.error("Failed to start Gemini Live session:", error);
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  private async listenForResponses() {
    if (!this.session) return;

    try {
      for await (const response of this.session.stream()) {
        const parts = response.candidates[0]?.content?.parts || [];
        
        for (const part of parts) {
          // Handle text responses
          if (part.text) {
            console.log("📝 TalkyTalky says:", part.text);
            this.onTextCallback?.(part.text);
          }

          // Handle audio responses
          if (part.inlineData?.data) {
            const audioData = part.inlineData.data;
            const audioBuffer = await this.decodeAudio(audioData);
            this.audioQueue.push(audioBuffer);
            this.playNextAudio();
          }
        }
      }
    } catch (error) {
      console.error("Error in response stream:", error);
      this.onErrorCallback?.(error as Error);
    }
  }

  private async decodeAudio(base64Data: string): Promise<AudioBuffer> {
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }

    // Convert PCM to WAV
    const wavBuffer = this.createWavBuffer(bytes);
    return await this.audioContext!.decodeAudioData(wavBuffer.buffer);
  }

  private createWavBuffer(pcmData: Uint8Array): Uint8Array {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Copy PCM data
    new Uint8Array(buffer, 44).set(pcmData);
    return new Uint8Array(buffer);
  }

  private async playNextAudio() {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;
    
    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext!.destination);
    
    source.onended = () => {
      this.isPlaying = false;
      this.onAudioCallback?.(audioBuffer);
      this.playNextAudio();
    };

    source.start();
  }

  async sendAudio(audioData: ArrayBuffer) {
    if (!this.session || !this.isConnected) {
      throw new Error("Not connected to Gemini Live");
    }

    try {
      // Convert audio to base64
      const bytes = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      await this.session.send({
        inlineData: {
          mimeType: "audio/pcm",
          data: base64,
        },
      });
    } catch (error) {
      console.error("Error sending audio:", error);
      this.onErrorCallback?.(error as Error);
    }
  }

  async sendText(text: string) {
    if (!this.session || !this.isConnected) {
      throw new Error("Not connected to Gemini Live");
    }

    try {
      await this.session.send({ text });
    } catch (error) {
      console.error("Error sending text:", error);
      this.onErrorCallback?.(error as Error);
    }
  }

  setContext(context: string) {
    this.currentContext = context;
    // Send context update to TalkyTalky
    this.sendText(`[CONTEXT UPDATE] ${context}`);
  }

  onAudio(callback: (audio: AudioBuffer) => void) {
    this.onAudioCallback = callback;
  }

  onText(callback: (text: string) => void) {
    this.onTextCallback = callback;
  }

  onError(callback: (error: Error) => void) {
    this.onErrorCallback = callback;
  }

  disconnect() {
    this.isConnected = false;
    this.session = null;
    this.audioQueue = [];
    console.log("👋 TalkyTalky disconnected");
  }

  isLive(): boolean {
    return this.isConnected;
  }
}

// Global singleton instance
export const geminiLiveSession = new GeminiLiveSessionManager();
