# 🐛 HANDOFF: Practice Page Debug - Gemini Live Not Working

**Date:** November 18, 2025  
**Issue:** Gemini Live assistant not functioning on Practice page  
**Priority:** CRITICAL  
**File:** `client/src/pages/PracticeLive.tsx`

---

## 📋 Issue Summary

The newly implemented unified Gemini Live assistant on the Practice page is not working as expected:

**Expected Behavior:**
1. ✅ User selects difficulty level (Beginner/Intermediate/Advanced)
2. ✅ User clicks "Start Session" button
3. ❌ **Gemini should introduce the word** (e.g., "Great! Let's practice the word 'Book'. This is a beginner-level word...")
4. ❌ User clicks Record button → records for 5 seconds
5. ❌ **Gemini should analyze and provide feedback** (e.g., "Well done! Your pronunciation was clear...")

**Actual Behavior:**
1. ✅ User selects difficulty level → word appears
2. ✅ User clicks "Start Session" → status changes to "Connected"
3. ❌ **No audio from Gemini** (no word introduction)
4. ✅ User clicks Record → countdown works, waveform animates
5. ❌ **No feedback after recording** (silence)

---

## 🎯 Expected Flow

### 1. Session Initialization
```typescript
// When user clicks "Start Session"
startSession() → {
  1. Create GoogleGenAI client
  2. Connect to Gemini Live with system prompt
  3. Session opens (onopen callback)
  4. Start microphone streaming
  5. 🔊 Gemini should automatically speak the introduction
}
```

**System Prompt Includes:**
- Current word: "Book"
- Difficulty: "beginner"
- Meaning: "A written work"
- Example: "I read a book every week"
- Smart Context (RAG): IELTS criteria, pronunciation guides
- **Instruction:** "Start by introducing the word 'Book' and explaining how to pronounce it!"

### 2. Expected Introduction (Gemini should say this automatically)
> "Great! Let's practice the word 'Book'. This is a beginner-level word with a short 'oo' sound. Make sure to round your lips for the 'oo' - it's different from the 'uh' sound in 'buck'. The 'B' sound is a voiced bilabial plosive - press your lips together and release. Ready to try?"

### 3. User Records
- User clicks Record button
- Audio streams to Gemini via `sendRealtimeInput()`
- Countdown: 5 → 4 → 3 → 2 → 1 → Auto-stop
- Waveform animation shows audio level

### 4. Expected Feedback (Gemini should say this after recording)
> "Well done! Your 'B' sound was clear and strong. The vowel 'oo' was good, but try rounding your lips a bit more. Let's try it again, or move to the next word!"

---

## 🔍 Technical Context

### File Structure
```
client/src/pages/PracticeLive.tsx  ← Main file (470 lines)
├── State Management (lines 18-32)
│   ├── Practice state (word, difficulty, score)
│   └── Gemini Live state (status, transcripts, audioLevel, isSpeaking, isRecording)
├── Refs (lines 34-47)
│   ├── sessionPromiseRef
│   ├── inputAudioContextRef / outputAudioContextRef
│   ├── mediaStreamRef
│   └── Audio nodes (processor, analyser, source)
├── startSession() (lines 139-268)
│   ├── Create system prompt with word context
│   ├── Connect to Gemini Live
│   ├── onopen: Start microphone streaming
│   ├── onmessage: Handle transcriptions and audio
│   └── onerror: Handle errors
└── UI Components (lines 327-505)
    ├── Difficulty selection
    ├── Current word display
    ├── TalkyTalky Coach card
    ├── Waveform animation
    ├── Conversation history
    └── Control buttons
```

### Gemini Live API Configuration
```typescript
sessionPromiseRef.current = ai.live.connect({
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  config: {
    systemInstruction: { parts: [{ text: systemPrompt }] },
  },
  callbacks: {
    onopen: async () => { /* Microphone setup */ },
    onmessage: async (message: LiveServerMessage) => { /* Handle responses */ },
    onerror: (error: any) => { /* Error handling */ },
  },
});
```

### Audio Handling

**Input (User → Gemini):**
```typescript
// Line 197-209: Audio processor sends PCM data
audioProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
  const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
  const pcmBlob: GenAIBlob = {
    data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
  
  if (sessionPromiseRef.current && isRecording) {
    sessionPromiseRef.current.then((session) => {
      session.sendRealtimeInput({ media: pcmBlob });
    });
  }
};
```

**Output (Gemini → User):**
```typescript
// Line 235-256: Audio playback from Gemini
const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
if (base64Audio && outputAudioContextRef.current) {
  setIsSpeaking(true);
  const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
  const source = outputAudioContextRef.current.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(outputAudioContextRef.current.destination);
  source.start(startTime);
}
```

---

## 🐛 Potential Issues

### Issue 1: Gemini Not Speaking After Session Opens
**Hypothesis:** System prompt might not be triggering automatic response

**Possible Causes:**
1. ❌ System instruction format incorrect
2. ❌ Gemini Live requires explicit "send message" after connection
3. ❌ Model not configured for automatic speech output
4. ❌ Missing speech configuration in `config`

**Debug Steps:**
1. Check if `onopen` callback is firing (add console.log)
2. Check if we need to send an initial message after connection
3. Compare with working AICoach.tsx implementation (lines 140-250)
4. Verify audio output context is properly initialized

**AICoach.tsx Working Example (for reference):**
```typescript
// Line 231-243 in AICoach.tsx
config: {
  speechConfig: {
    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
  },
  systemInstruction: { 
    parts: [{ 
      text: smartContext 
        ? `${TALKYTALKY_SYSTEM_PROMPT}\n\n${smartContext}`
        : TALKYTALKY_SYSTEM_PROMPT 
    }] 
  },
  inputAudioTranscription: {},
  outputAudioTranscription: {},
},
```

### Issue 2: No Feedback After Recording
**Hypothesis:** Gemini not receiving or processing user audio

**Possible Causes:**
1. ❌ `sendRealtimeInput()` not working during `isRecording`
2. ❌ Audio format mismatch (PCM encoding issue)
3. ❌ `turnComplete` not triggering properly
4. ❌ Transcription not being captured

**Debug Steps:**
1. Add console.log in `onaudioprocess` to verify audio is being sent
2. Check if `message.serverContent?.inputTranscription` is populated
3. Check if `message.serverContent?.turnComplete` is firing
4. Verify `isRecording` state is true during recording

### Issue 3: Missing Speech Configuration
**Hypothesis:** PracticeLive.tsx missing speech config that AICoach.tsx has

**Key Difference:**
```typescript
// AICoach.tsx HAS this:
speechConfig: {
  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
},

// PracticeLive.tsx MISSING this ❌
```

**Fix:** Add speech config to PracticeLive.tsx

---

## 🔧 Debugging Checklist

### Step 1: Verify Session Connection
```typescript
// Add to onopen callback (line 183)
console.log('✅ Gemini Live session opened');
console.log('📝 System prompt:', systemPrompt);
console.log('🎤 Microphone stream:', mediaStreamRef.current);
console.log('🔊 Output audio context:', outputAudioContextRef.current);
```

### Step 2: Check Message Handling
```typescript
// Add to onmessage callback (line 217)
console.log('📨 Received message:', message);
console.log('🗣️ Output transcription:', message.serverContent?.outputTranscription);
console.log('🎧 Input transcription:', message.serverContent?.inputTranscription);
console.log('✅ Turn complete:', message.serverContent?.turnComplete);
console.log('🎵 Audio data:', message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data ? 'YES' : 'NO');
```

### Step 3: Verify Audio Streaming
```typescript
// Add to onaudioprocess (line 197)
console.log('🎤 Sending audio, isRecording:', isRecording);
```

### Step 4: Check for Errors
```typescript
// Add to onerror callback (line 264)
console.error('❌ Gemini Live error:', error);
console.error('📊 Error details:', JSON.stringify(error, null, 2));
```

---

## 🎯 Comparison: AICoach vs PracticeLive

| Feature | AICoach.tsx (✅ Working) | PracticeLive.tsx (❌ Not Working) |
|---------|-------------------------|----------------------------------|
| **Speech Config** | ✅ Has `speechConfig` with voice | ❌ Missing `speechConfig` |
| **Transcription** | ✅ Has `inputAudioTranscription` | ❌ Missing in config |
| **Transcription** | ✅ Has `outputAudioTranscription` | ❌ Missing in config |
| **System Prompt** | ✅ Uses constant + smart context | ✅ Uses inline prompt + smart context |
| **Audio Playback** | ✅ Same implementation | ✅ Same implementation |
| **Recording** | ✅ Manual start/stop | ✅ Auto-stop with countdown |

**Key Missing Pieces in PracticeLive.tsx:**
1. ❌ `speechConfig` with voice configuration
2. ❌ `inputAudioTranscription: {}`
3. ❌ `outputAudioTranscription: {}`

---

## 🛠️ Suggested Fix

### Fix 1: Add Missing Configuration
```typescript
// Line 176-180: Update config
sessionPromiseRef.current = ai.live.connect({
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  config: {
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
    },
    systemInstruction: { parts: [{ text: systemPrompt }] },
    inputAudioTranscription: {},
    outputAudioTranscription: {},
  },
  callbacks: { /* ... */ },
});
```

### Fix 2: Send Initial Message (if needed)
```typescript
// After onopen, send initial message to trigger response
onopen: async () => {
  console.log('Gemini Live session opened');
  setStatus(AppStatus.CONNECTED);
  
  // ... microphone setup ...
  
  // Send initial message to trigger introduction
  const session = await sessionPromiseRef.current;
  session.send({ text: "Please introduce the current word." });
},
```

### Fix 3: Verify Audio Output
```typescript
// Ensure outputAudioContextRef is properly initialized
outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
  sampleRate: 24000,
  latencyHint: 'interactive', // Add this for better responsiveness
});
```

---

## 📊 Test Plan

### Test 1: Session Connection
1. Open Practice page
2. Select Beginner level
3. Click "Start Session"
4. **Expected:** Console shows "✅ Gemini Live session opened"
5. **Expected:** Status changes to "Connected"
6. **Expected:** Gemini speaks introduction within 2-3 seconds

### Test 2: Word Introduction
1. After session connects
2. **Expected:** Hear Gemini say: "Great! Let's practice the word 'Book'..."
3. **Expected:** See transcript appear in conversation history
4. **Expected:** `isSpeaking` state becomes true during speech

### Test 3: Recording and Feedback
1. Click Record button
2. Say the word "Book"
3. Wait for 5-second countdown to complete
4. **Expected:** Recording stops automatically
5. **Expected:** Gemini responds within 2-3 seconds
6. **Expected:** Hear feedback like "Well done! Your pronunciation was clear..."
7. **Expected:** See user transcript (blue) and Gemini response (purple)

### Test 4: Conversation Flow
1. Complete one word
2. Click "Next Word"
3. **Expected:** Session restarts with new word
4. **Expected:** Gemini introduces new word
5. **Expected:** Full conversation history preserved

---

## 🔗 Related Files

### Working Reference (AI Coach)
- `client/src/pages/AICoach.tsx` (lines 140-250) - Working Gemini Live implementation
- Uses same audio handling, but has `speechConfig`

### Audio Utilities
- `client/src/utils/audio.ts` - encode/decode/decodeAudioData functions
- Used for PCM audio conversion

### Components
- `client/src/components/VoiceWaveform.tsx` - Waveform animation (working)
- `client/src/components/TalkyLogo.tsx` - Logo component (working)

### Backend (RAG)
- `server/ragRouter.ts` (line 43-68) - `getSmartContext` endpoint
- `server/ragService.ts` (line 67-130) - Smart Context retrieval logic

---

## 💡 Additional Notes

### Why This Architecture?
The unified Gemini Live assistant was designed to replace separate API calls:
- **Old:** `analyzePronunciation` API + `generateSpeech` API (2 separate requests)
- **New:** One Gemini Live session (continuous conversation)

### Benefits (When Working)
1. Natural conversational flow
2. Context-aware coaching
3. Real-time feedback
4. No API quota issues (one session)
5. Personalized tips using RAG

### Current Status
- ✅ UI working (word display, buttons, waveform)
- ✅ Recording working (countdown, audio capture)
- ✅ RAG integration working (Smart Context fetched)
- ❌ Gemini not speaking (no introduction, no feedback)
- ❌ Audio output not working

---

## 🎯 Success Criteria

**Fix is successful when:**
1. ✅ User clicks "Start Session" → Gemini introduces word within 3 seconds
2. ✅ User records pronunciation → Gemini provides feedback within 3 seconds
3. ✅ Conversation history shows both user and Gemini transcripts
4. ✅ Audio playback works (hear Gemini's voice)
5. ✅ Multiple words work (session persists or restarts cleanly)

---

## 📞 Contact Context

**User Feedback:**
> "She is not working on practice pages. No announcement no feedback after recording."

**Translation:**
- "She" = Gemini Live assistant
- "No announcement" = No word introduction when session starts
- "No feedback after recording" = No response after user records pronunciation

**User Expectation:**
Same conversational experience as AI Coach page, but focused on pronunciation practice with specific words.

---

## 🚀 Next Steps for Gemini

1. **Add missing configuration** (`speechConfig`, transcription configs)
2. **Add debug logging** to verify session connection and message flow
3. **Test audio output** to ensure Gemini's voice is heard
4. **Verify recording** to ensure user audio reaches Gemini
5. **Test full flow** from introduction → recording → feedback
6. **Compare with AICoach.tsx** to identify any other missing pieces

Good luck! 🎯
