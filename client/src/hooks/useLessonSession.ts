/**
 * useLessonSession Hook - AI Coach Lesson Session Management
 * 
 * Manages lesson session state with database synchronization.
 * Implements single source of truth for word state tracking.
 */

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface LessonSessionState {
    sessionId: number | null;
    lessonId: string;
    lessonTitle: string;
    wordOrder: string[];
    currentWordIndex: number;
    isRandomized: boolean;
    status: 'idle' | 'active' | 'paused' | 'completed';
}

export function useLessonSession() {
    const [state, setState] = useState<LessonSessionState>({
        sessionId: null,
        lessonId: '',
        lessonTitle: '',
        wordOrder: [],
        currentWordIndex: 0,
        isRandomized: false,
        status: 'idle',
    });

    const createSession = trpc.lesson.createSession.useMutation();
    const updateSession = trpc.lesson.updateSessionProgress.useMutation();
    const recordAttempt = trpc.lesson.recordWordAttempt.useMutation();

    /**
     * Start a new lesson session
     */
    const startSession = useCallback(async (
        lessonId: string,
        lessonTitle: string,
        wordIds: string[],
        isRandomized: boolean,
        lessonImportance?: string,
        lessonContext?: string
    ) => {
        const wordOrder = isRandomized
            ? [...wordIds].sort(() => Math.random() - 0.5)
            : wordIds;

        const result = await createSession.mutateAsync({
            lessonId,
            lessonTitle,
            wordOrder,
            isRandomized,
            lessonImportance,
            lessonContext,
        });

        setState({
            sessionId: result.sessionId,
            lessonId,
            lessonTitle,
            wordOrder: result.wordOrder,
            currentWordIndex: 0,
            isRandomized,
            status: 'active',
        });

        return result;
    }, [createSession]);

    /**
     * Move to next word in the session (returns next word ID)
     */
    const nextWord = useCallback(async () => {
        if (!state.sessionId) return null;

        const nextIndex = state.currentWordIndex + 1;

        if (nextIndex >= state.wordOrder.length) {
            // Lesson complete
            setState(prev => ({ ...prev, status: 'completed' }));
            await updateSession.mutateAsync({
                sessionId: state.sessionId,
                status: 'completed',
                currentWordIndex: nextIndex,
            });
            return null;
        }

        setState(prev => ({ ...prev, currentWordIndex: nextIndex, status: 'active' }));
        await updateSession.mutateAsync({
            sessionId: state.sessionId,
            currentWordIndex: nextIndex,
        });

        return state.wordOrder[nextIndex];
    }, [state.sessionId, state.currentWordIndex, state.wordOrder, updateSession]);

    /**
     * Shuffle word order (only works before session starts)
     */
    const shuffleWords = useCallback(() => {
        if (state.status !== 'idle') {
            console.warn('Cannot shuffle words after session has started');
            return;
        }

        const shuffled = [...state.wordOrder].sort(() => Math.random() - 0.5);
        setState(prev => ({ ...prev, wordOrder: shuffled, isRandomized: true }));
    }, [state.wordOrder, state.status]);

    /**
     * Record a word practice attempt
     */
    const recordWordAttempt = useCallback(async (
        wordId: string,
        score: number | null,
        transcription: string,
        feedback: string,
        contextUsed?: string
    ) => {
        if (!state.sessionId) return;

        await recordAttempt.mutateAsync({
            lessonSessionId: state.sessionId,
            wordId,
            wordPosition: state.currentWordIndex + 1,
            pronunciationScore: score,
            userTranscription: transcription,
            aiFeedback: feedback,
            contextUsed,
        });
    }, [state.sessionId, state.currentWordIndex, recordAttempt]);

    /**
     * Pause the current session
     */
    const pauseSession = useCallback(async () => {
        if (!state.sessionId) return;

        setState(prev => ({ ...prev, status: 'paused' }));
        await updateSession.mutateAsync({
            sessionId: state.sessionId,
            status: 'paused',
        });
    }, [state.sessionId, updateSession]);

    return {
        state,
        startSession,
        nextWord,
        shuffleWords,
        recordWordAttempt,
        pauseSession,
    };
}
