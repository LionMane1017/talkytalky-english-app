// Ultra-efficient 8-bit sound system using Web Audio API
// Generates sounds procedurally - no audio files needed!

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  // 8-bit beep generator
  private beep(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.3) {
    if (!this.enabled) return;
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  }

  // Multi-tone sequence
  private sequence(notes: Array<[number, number]>, type: OscillatorType = 'square') {
    if (!this.enabled) return;
    let time = 0;
    notes.forEach(([freq, dur]) => {
      setTimeout(() => this.beep(freq, dur, type), time);
      time += dur * 1000;
    });
  }

  // Sound effects
  success() {
    // Happy ascending arpeggio
    this.sequence([[523, 0.1], [659, 0.1], [784, 0.15]], 'square');
  }

  bigSuccess() {
    // Major chord celebration
    this.sequence([
      [523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.2]
    ], 'square');
  }

  click() {
    // Quick blip
    this.beep(800, 0.05, 'square', 0.2);
  }

  hover() {
    // Soft chirp
    this.beep(600, 0.03, 'sine', 0.15);
  }

  error() {
    // Descending sad tone
    this.sequence([[400, 0.1], [300, 0.15]], 'sawtooth');
  }

  encourage() {
    // Gentle uplifting tone
    this.sequence([[440, 0.08], [523, 0.12]], 'triangle');
  }

  achievement() {
    // Epic fanfare
    this.sequence([
      [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.15], [784, 0.1], [1047, 0.25]
    ], 'square');
  }

  levelUp() {
    // Power-up sound
    this.sequence([
      [262, 0.05], [330, 0.05], [392, 0.05], [523, 0.05], [659, 0.2]
    ], 'square');
  }

  streak() {
    // Fire sound
    this.sequence([
      [800, 0.05], [900, 0.05], [1000, 0.05], [1100, 0.15]
    ], 'sawtooth');
  }

  thinking() {
    // Curious tone
    this.beep(500, 0.1, 'sine', 0.2);
  }

  greeting() {
    // Friendly hello
    this.sequence([[523, 0.08], [659, 0.08], [523, 0.12]], 'triangle');
  }

  highFive() {
    // Slap sound
    this.beep(150, 0.08, 'sawtooth', 0.4);
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      localStorage.setItem('soundEnabled', 'true');
    } else {
      localStorage.removeItem('soundEnabled');
    }
  }

  isEnabled() {
    return this.enabled;
  }

  constructor() {
    // Check localStorage for saved preference
    this.enabled = localStorage.getItem('soundEnabled') !== null;
  }
}

// Singleton instance
export const sounds = new SoundManager();
