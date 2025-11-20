import { motion } from "framer-motion";

// V2: Precise recreation of the Retro Pink Bear from the mascot video
// Character traits: Hot Pink Fur, Cyan Triangle Shades, 80s Brick Phone, Yellow/Blue Sash Top

export type MascotMood = 'happy' | 'thinking' | 'excited' | 'listening' | 'celebrating' | 'encouraging';

interface MascotSVGProps {
  mood?: MascotMood;
}

export const MascotSVG = ({ mood = 'happy' }: MascotSVGProps) => (
  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
    {/* --- DEFINITIONS --- */}
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="pinkGradient" cx="50%" cy="50%">
        <stop offset="0%" stopColor="#FF66DD" />
        <stop offset="100%" stopColor="#FF44CC" />
      </radialGradient>
    </defs>

    {/* --- BASE CHARACTER GROUP --- */}
    <g transform="translate(50, 20) scale(1.1)">
        
        {/* 1. EARS (Round, Hot Pink) */}
        <motion.circle 
          cx="25" cy="25" r="18" 
          fill="url(#pinkGradient)"
          animate={mood === 'listening' ? { scaleY: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <motion.circle 
          cx="75" cy="25" r="18" 
          fill="url(#pinkGradient)"
          animate={mood === 'listening' ? { scaleY: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
        />
        {/* Inner Ears */}
        <circle cx="25" cy="25" r="8" fill="#FF99DD" />
        <circle cx="75" cy="25" r="8" fill="#FF99DD" />

        {/* 2. HEAD (Wide Oval, Hot Pink) */}
        <ellipse cx="50" cy="55" rx="45" ry="40" fill="url(#pinkGradient)" />

        {/* 3. BODY (Yellow Shirt, Blue Sash) */}
        <g transform="translate(15, 90)">
            {/* Torso - Yellow Shirt */}
            <path d="M0,0 Q35,-5 70,0 L70,60 Q35,65 0,60 Z" fill="#FFFF00" stroke="#DDDD00" strokeWidth="1" />
            {/* Blue Diagonal Sash */}
            <path d="M0,0 L30,0 L70,60 L40,60 Z" fill="#4444FF" opacity="0.9" />
            {/* Sash highlight */}
            <path d="M5,5 L28,5 L65,55 L42,55 Z" fill="#6666FF" opacity="0.3" />
        </g>

        {/* 4. FACE DETAILS */}
        {/* Snout Area */}
        <ellipse cx="50" cy="70" rx="15" ry="10" fill="#FF77DD" />
        {/* Nose */}
        <path d="M46,68 L54,68 L50,74 Z" fill="#330033" />
        
        {/* Mouth (Changes based on mood) */}
        {mood === 'happy' && (
          <motion.path 
            d="M45,78 Q50,85 55,78" 
            stroke="#330033" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
            animate={{ d: ["M45,78 Q50,85 55,78", "M45,78 Q50,82 55,78", "M45,78 Q50,85 55,78"] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {mood === 'excited' && (
          <motion.path 
            d="M42,78 Q50,90 58,78" 
            stroke="#330033" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
            animate={{ d: ["M42,78 Q50,90 58,78", "M42,78 Q50,92 58,78", "M42,78 Q50,90 58,78"] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}
        
        {mood === 'celebrating' && (
          <>
            <ellipse cx="50" cy="82" rx="8" ry="10" fill="#7f1d1d" />
            <motion.path 
              d="M40,78 Q50,88 60,78" 
              stroke="#330033" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
        
        {mood === 'listening' && (
          <motion.path 
            d="M45,78 Q50,85 55,78" 
            stroke="#330033" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            animate={{ d: ["M45,78 Q50,85 55,78", "M45,80 Q50,83 55,80", "M45,78 Q50,85 55,78"] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        
        {mood === 'encouraging' && (
          <path 
            d="M43,78 Q50,83 57,78" 
            stroke="#330033" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
        )}
        
        {mood === 'thinking' && (
          <line x1="45" y1="78" x2="55" y2="78" stroke="#330033" strokeWidth="2" strokeLinecap="round" />
        )}

        {/* 5. ACCESSORIES */}
        
        {/* SUNGLASSES (Cyan Triangles - Signature Feature!) */}
        <g transform="translate(0, -5)" filter="url(#glow)">
            {/* Left Lens - Triangle */}
            <path d="M15,45 L48,45 L30,65 Z" fill="#00FFFF" stroke="#FFFFFF" strokeWidth="2" />
            {/* Right Lens - Triangle */}
            <path d="M52,45 L85,45 L70,65 Z" fill="#00FFFF" stroke="#FFFFFF" strokeWidth="2" />
            {/* Bridge */}
            <line x1="48" y1="48" x2="52" y2="48" stroke="#FFFFFF" strokeWidth="2" />
            {/* Reflection Lines (makes glasses look shiny) */}
            <line x1="20" y1="50" x2="35" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="65" y1="50" x2="80" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Small reflection dots */}
            <circle cx="25" cy="52" r="2" fill="white" opacity="0.8" />
            <circle cx="75" cy="52" r="2" fill="white" opacity="0.8" />
        </g>

        {/* THE BRICK PHONE (Grey, Huge, Antenna - 80s Icon!) */}
        <motion.g 
          transform="translate(-15, 40) rotate(-15)"
          animate={mood === 'listening' ? { rotate: [-15, -12, -15] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
            {/* Phone Body */}
            <rect x="0" y="0" width="25" height="60" fill="#CCCCCC" stroke="#999999" strokeWidth="1.5" rx="2" />
            {/* Screen Area */}
            <rect x="5" y="10" width="15" height="15" fill="#003300" stroke="#00FF00" strokeWidth="0.5" />
            {/* Green screen glow */}
            <rect x="6" y="11" width="13" height="13" fill="#00FF00" opacity="0.2" />
            {/* Keypad Area */}
            <rect x="5" y="30" width="15" height="25" fill="#333333" />
            {/* Keypad buttons (3x4 grid) */}
            {[0, 1, 2].map(row => 
              [0, 1, 2].map(col => (
                <rect 
                  key={`${row}-${col}`}
                  x={7 + col * 4} 
                  y={32 + row * 6} 
                  width="3" 
                  height="4" 
                  fill="#666666" 
                  rx="0.5"
                />
              ))
            )}
            {/* Antenna (iconic!) */}
            <line x1="5" y1="0" x2="5" y2="-20" stroke="#666666" strokeWidth="3" strokeLinecap="round" />
            <circle cx="5" cy="-20" r="2" fill="#FF0000" /> {/* Red antenna tip */}
            
            {/* Hand/Paw Holding Phone */}
            <ellipse cx="25" cy="40" rx="10" ry="8" fill="#FF44CC" />
            {/* Paw pads */}
            <circle cx="25" cy="38" r="2" fill="#FF77DD" />
            <circle cx="22" cy="42" r="1.5" fill="#FF77DD" />
            <circle cx="28" cy="42" r="1.5" fill="#FF77DD" />
        </motion.g>

        {/* Celebrating mode: Confetti particles */}
        {mood === 'celebrating' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.rect
                key={i}
                x={20 + i * 10}
                y={10}
                width="3"
                height="3"
                fill={['#FF44CC', '#00FFFF', '#FFFF00', '#4444FF'][i % 4]}
                animate={{
                  y: [10, 100],
                  x: [20 + i * 10, 20 + i * 10 + (Math.random() - 0.5) * 40],
                  rotate: [0, 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}

        {/* Thinking mode: Thought bubble */}
        {mood === 'thinking' && (
          <g>
            <motion.circle
              cx="85"
              cy="35"
              r="8"
              fill="white"
              stroke="#330033"
              strokeWidth="1.5"
              opacity="0.9"
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx="78" cy="42" r="4" fill="white" stroke="#330033" strokeWidth="1" opacity="0.7" />
            <circle cx="72" cy="46" r="2" fill="white" stroke="#330033" strokeWidth="0.5" opacity="0.5" />
            {/* Question mark in thought bubble */}
            <text x="82" y="40" fontSize="10" fill="#330033" fontWeight="bold">?</text>
          </g>
        )}
    </g>
  </svg>
);

// Particle effects for celebrations (unchanged from V1)
export const Confetti = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#FF44CC', '#00FFFF', '#FFFF00', '#4444FF'][i % 4], // Match retro colors
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
              fill="#00FFFF" // Cyan sparkles to match sunglasses
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
