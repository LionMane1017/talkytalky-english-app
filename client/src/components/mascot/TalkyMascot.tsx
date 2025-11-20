import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotSVG, Confetti, Sparkles, type MascotMood } from './MascotAssets';
import { useLocation } from "wouter";
import { sounds } from '@/lib/sounds';

interface MascotMessage {
  text: string;
  duration?: number;
}

export function TalkyMascot() {
  const [location] = useLocation();
  const [mood, setMood] = useState<MascotMood>('happy');
  const [message, setMessage] = useState<MascotMessage | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [personalityMode, setPersonalityMode] = useState<'energetic' | 'calm'>('energetic');
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem('mascotVisible') !== 'false';
  });
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Helper to show message
  const showMessage = (text: string, duration = 3000) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage({ text, duration });
    messageTimeoutRef.current = setTimeout(() => setMessage(null), duration);
  };

  // 1. CONTEXTUAL AWARENESS - React to page changes
  useEffect(() => {
    if (location === '/practice' || location === '/practice-live') {
      setMood('listening');
      showMessage("I'm listening! Let's practice together! 🎤");
      sounds.greeting();
    } else if (location === '/ai-coach') {
      setMood('excited');
      showMessage("Ready for your coaching session! 🎯");
      sounds.encourage();
    } else if (location === '/leaderboard') {
      setMood('excited');
      showMessage("Look at those amazing scores! 🏆");
      sounds.success();
    } else if (location === '/learning-paths') {
      setMood('thinking');
      showMessage("Time to learn something new! 📚");
      sounds.thinking();
    } else if (location === '/') {
      setMood('happy');
      showMessage("Welcome back! Ready to practice? 😊", 4000);
      sounds.greeting();
    } else {
      setMood('happy');
    }
  }, [location]);

  // 2. ADAPTIVE PERSONALITY - Switch from energetic to calm after failures
  useEffect(() => {
    if (failureCount >= 3 && personalityMode === 'energetic') {
      setPersonalityMode('calm');
      setMood('encouraging');
      showMessage("Take a deep breath. You're doing great! Let's try a different approach. 🌟", 5000);
    } else if (failureCount === 0 && personalityMode === 'calm') {
      setPersonalityMode('energetic');
    }
  }, [failureCount, personalityMode]);

  // 3. EVENT-DRIVEN ANIMATION SYSTEM
  useEffect(() => {
    // Success event
    const handleSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      const score = customEvent.detail?.score || 0;
      
      setFailureCount(0); // Reset failure count on success
      setMood('celebrating');
      setShowConfetti(true);
      setShowSparkles(true);

      if (score >= 90) {
        showMessage("🎉 PERFECT! You're a pronunciation master!", 4000);
        sounds.bigSuccess();
      } else if (score >= 80) {
        showMessage("Amazing job! Keep up the great work! ⭐", 3000);
        sounds.success();
      } else {
        showMessage("Good progress! You're improving! 👍", 3000);
        sounds.encourage();
      }

      setTimeout(() => {
        setMood('happy');
        setShowConfetti(false);
        setShowSparkles(false);
      }, 3000);
    };

    // Practice start event
    const handlePracticeStart = () => {
      setMood('listening');
      showMessage("I'm all ears! You got this! 👂", 2000);
      sounds.greeting();
    };

    // Achievement unlock event
    const handleAchievement = (event: Event) => {
      const customEvent = event as CustomEvent;
      const achievement = customEvent.detail?.achievement || '';
      
      setMood('celebrating');
      setShowConfetti(true);
      showMessage(`🏆 Achievement Unlocked: ${achievement}!`, 5000);
      sounds.achievement();

      setTimeout(() => {
        setMood('happy');
        setShowConfetti(false);
      }, 4000);
    };

    // Failure/retry event
    const handleRetry = () => {
      setFailureCount(prev => prev + 1);
      
      if (personalityMode === 'energetic') {
        setMood('encouraging');
        const messages = [
          "Don't worry! Let's try that again! 💪",
          "You're learning! One more time! 🌟",
          "Almost there! Keep going! 🎯"
        ];
        showMessage(messages[Math.floor(Math.random() * messages.length)], 3000);
        sounds.encourage();
      } else {
        // Calm mode - more supportive
        setMood('encouraging');
        const messages = [
          "Take your time. You're doing fine. 🌸",
          "Every attempt is progress. Keep going. ✨",
          "Breathe. You've got this. 🌟"
        ];
        showMessage(messages[Math.floor(Math.random() * messages.length)], 4000);
        sounds.encourage();
      }

      setTimeout(() => setMood('happy'), 3000);
    };

    // Streak milestone event
    const handleStreak = (event: Event) => {
      const customEvent = event as CustomEvent;
      const days = customEvent.detail?.days || 0;
      
      setMood('celebrating');
      setShowSparkles(true);
      showMessage(`🔥 ${days}-day streak! You're on fire!`, 4000);
      sounds.streak();

      setTimeout(() => {
        setMood('happy');
        setShowSparkles(false);
      }, 3500);
    };

    // Register event listeners
    window.addEventListener('talky:success', handleSuccess);
    window.addEventListener('talky:practice-start', handlePracticeStart);
    window.addEventListener('talky:achievement', handleAchievement);
    window.addEventListener('talky:retry', handleRetry);
    window.addEventListener('talky:streak', handleStreak);

    return () => {
      window.removeEventListener('talky:success', handleSuccess);
      window.removeEventListener('talky:practice-start', handlePracticeStart);
      window.removeEventListener('talky:achievement', handleAchievement);
      window.removeEventListener('talky:retry', handleRetry);
      window.removeEventListener('talky:streak', handleStreak);
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [personalityMode]);

  // 4. INTERACTIVE "HIGH FIVE" FEATURE
  const handleClick = () => {
    setMood('excited');
    setShowSparkles(true);
    showMessage("High Five! ✋ You're awesome!", 2000);
    sounds.highFive();
    
    setTimeout(() => {
      setMood('happy');
      setShowSparkles(false);
    }, 2000);
  };

  // 5. RANDOM PERSONALITY MOMENTS (every 3 minutes when idle)
  useEffect(() => {
    const randomMessages = [
      { text: "Still here if you need me! 😊", mood: 'happy' as MascotMood },
      { text: "Ready to practice when you are! 🎤", mood: 'listening' as MascotMood },
      { text: "You're doing great today! 🌟", mood: 'encouraging' as MascotMood },
    ];

    const interval = setInterval(() => {
      if (!message) { // Only show if no other message is active
        const random = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        setMood(random.mood);
        showMessage(random.text, 3000);
        setTimeout(() => setMood('happy'), 3000);
      }
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [message]);

  // Listen for mascot toggle event
  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      const isVisible = customEvent.detail?.visible ?? true;
      setVisible(isVisible);
    };

    window.addEventListener('mascot:toggle', handleToggle);
    return () => window.removeEventListener('mascot:toggle', handleToggle);
  }, []);

  if (!visible) return null;

  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50 pointer-events-auto cursor-pointer select-none"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      style={{ maxWidth: '140px', maxHeight: '140px' }}
    >
      {/* Particle Effects */}
      {showConfetti && <Confetti />}
      {showSparkles && <Sparkles />}

      {/* Speech Bubble */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: -10 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-full right-0 mb-4 bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-2xl font-semibold text-sm whitespace-nowrap max-w-xs"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
            }}
          >
            {message.text}
            {/* Speech bubble tail */}
            <div 
              className="absolute top-full right-8 border-8 border-transparent border-t-white"
              style={{ marginTop: '-1px' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Mascot Character with Glassmorphism */}
      <motion.div 
        className="w-28 h-28 md:w-32 md:h-32 relative rounded-full p-3"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <MascotSVG mood={mood} />
        
        {/* Glow effect for excited/celebrating moods */}
        {(mood === 'excited' || mood === 'celebrating') && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>

      {/* Personality Mode Indicator (for debugging/testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 text-xs bg-black/50 text-white px-2 py-1 rounded">
          {personalityMode}
        </div>
      )}
    </motion.div>
  );
}
