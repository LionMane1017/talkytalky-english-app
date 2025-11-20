import { motion } from "framer-motion";

// Simple SVG representation of TalkyTalky (Pink Character with book and sunglasses)
// Based on the mascot video - vibrant, colorful, friendly character
// In V2, replace these SVGs with Lottie JSON imports for more complex animations

export type MascotMood = 'happy' | 'thinking' | 'excited' | 'listening' | 'celebrating' | 'encouraging';

interface MascotSVGProps {
  mood?: MascotMood;
}

export const MascotSVG = ({ mood = 'happy' }: MascotSVGProps) => (
  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
    {/* Body - Pink character */}
    <motion.ellipse
      cx="50"
      cy="60"
      rx="25"
      ry="30"
      fill="#ec4899"
      animate={{ scaleY: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    
    {/* Ears - Pink with darker inner */}
    <motion.path 
      d="M25,35 L15,15 L35,30" 
      fill="#ec4899"
      animate={mood === 'listening' ? { rotate: [-5, 5, -5] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      style={{ transformOrigin: "25px 35px" }}
    />
    <path d="M20,25 L18,20 L28,28" fill="#db2777" />
    
    <motion.path 
      d="M75,35 L85,15 L65,30" 
      fill="#ec4899"
      animate={mood === 'listening' ? { rotate: [5, -5, 5] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      style={{ transformOrigin: "75px 35px" }}
    />
    <path d="M80,25 L82,20 L72,28" fill="#db2777" />
    
    {/* Head */}
    <circle cx="50" cy="45" r="20" fill="#ec4899" />
    
    {/* Sunglasses */}
    <rect x="35" y="42" width="12" height="8" rx="2" fill="#38bdf8" opacity="0.8" />
    <rect x="53" y="42" width="12" height="8" rx="2" fill="#38bdf8" opacity="0.8" />
    <line x1="47" y1="46" x2="53" y2="46" stroke="#1e293b" strokeWidth="2" />
    
    {/* Face based on Mood */}
    {mood === 'happy' && (
      <>
        {/* Smile */}
        <path d="M40,55 Q50,62 60,55" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    )}
    
    {mood === 'excited' && (
      <>
        {/* Big smile */}
        <motion.path 
          d="M38,55 Q50,68 62,55" 
          stroke="white" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
          animate={{ d: ["M38,55 Q50,68 62,55", "M38,55 Q50,70 62,55", "M38,55 Q50,68 62,55"] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
        {/* Sparkles */}
        <motion.circle
          cx="70"
          cy="35"
          r="2"
          fill="#fbbf24"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="30"
          cy="35"
          r="2"
          fill="#fbbf24"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />
      </>
    )}
    
    {mood === 'celebrating' && (
      <>
        {/* Open mouth celebration */}
        <ellipse cx="50" cy="58" rx="8" ry="10" fill="#7f1d1d" />
        <motion.path 
          d="M38,52 Q50,65 62,52" 
          stroke="white" 
          strokeWidth="3" 
          fill="none"
          strokeLinecap="round"
        />
        {/* Confetti */}
        <motion.rect
          x="70"
          y="30"
          width="3"
          height="3"
          fill="#ec4899"
          animate={{ y: [30, 70], rotate: [0, 360], opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.rect
          x="30"
          y="30"
          width="3"
          height="3"
          fill="#38bdf8"
          animate={{ y: [30, 70], rotate: [0, -360], opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
      </>
    )}
    
    {mood === 'listening' && (
      <>
        {/* Focused expression */}
        <path d="M42,55 L58,55" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Sound waves */}
        <motion.path
          d="M75,45 Q80,45 80,45"
          stroke="#38bdf8"
          strokeWidth="2"
          fill="none"
          animate={{ d: ["M75,45 Q80,45 80,45", "M75,45 Q85,45 90,45", "M75,45 Q80,45 80,45"] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </>
    )}
    
    {mood === 'encouraging' && (
      <>
        {/* Gentle smile */}
        <path d="M42,55 Q50,60 58,55" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Thumbs up */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <rect x="68" y="60" width="6" height="10" rx="2" fill="#fbbf24" />
          <rect x="68" y="57" width="6" height="5" rx="2" fill="#fbbf24" transform="rotate(-30 71 57)" />
        </motion.g>
      </>
    )}
    
    {mood === 'thinking' && (
      <>
        {/* Neutral expression */}
        <line x1="42" y1="55" x2="58" y2="55" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Thought bubble */}
        <motion.circle
          cx="72"
          cy="30"
          r="3"
          fill="white"
          opacity="0.8"
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx="68" cy="35" r="2" fill="white" opacity="0.6" />
        <circle cx="65" cy="38" r="1.5" fill="white" opacity="0.4" />
      </>
    )}
    
    {/* Book in hand (signature element from video) */}
    <g transform="translate(28, 75)">
      <rect x="0" y="0" width="15" height="12" rx="1" fill="#a855f7" />
      <rect x="1" y="1" width="13" height="10" rx="0.5" fill="#c084fc" />
      <line x1="3" y1="4" x2="11" y2="4" stroke="white" strokeWidth="0.5" opacity="0.7" />
      <line x1="3" y1="6" x2="11" y2="6" stroke="white" strokeWidth="0.5" opacity="0.7" />
      <line x1="3" y1="8" x2="9" y2="8" stroke="white" strokeWidth="0.5" opacity="0.7" />
    </g>
  </svg>
);

// Particle effects for celebrations
export const Confetti = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#ec4899', '#38bdf8', '#fbbf24', '#a855f7'][i % 4],
    delay: i * 0.05,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${50 + (Math.random() - 0.5) * 40}%`,
            top: '50%',
          }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [-20, 100],
            x: [(Math.random() - 0.5) * 100],
            opacity: [1, 0],
            scale: [1, 0.5],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Sparkle effect for success moments
export const Sparkles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${25 + i * 20}%`,
            top: `${30 + (i % 2) * 20}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path
              d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
              fill="#fbbf24"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
