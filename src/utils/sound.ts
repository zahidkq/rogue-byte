const SOUND_PREF_KEY = 'rogue_byte_sound_enabled';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem(SOUND_PREF_KEY);
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    try {
      localStorage.setItem(SOUND_PREF_KEY, String(val));
    } catch {
      // ignore storage quota errors
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.06,
    freqEnd?: number,
    delay: number = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playMove() {
    this.tone(170, 0.045, 'triangle', 0.035, 110);
  }

  public playGold() {
    this.tone(740, 0.08, 'sine', 0.055, 920);
    this.tone(1046, 0.14, 'sine', 0.055, 1318, 0.055);
  }

  public playPotion() {
    this.tone(420, 0.12, 'sine', 0.055, 680);
    this.tone(680, 0.16, 'triangle', 0.045, 940, 0.07);
  }

  public playTrap() {
    this.tone(240, 0.12, 'sawtooth', 0.07, 75);
    this.tone(120, 0.18, 'square', 0.05, 55, 0.05);
  }

  public playHit() {
    this.tone(210, 0.09, 'sawtooth', 0.07, 85);
  }

  public playCrit() {
    this.tone(320, 0.08, 'sawtooth', 0.08, 620);
    this.tone(540, 0.14, 'square', 0.06, 160, 0.04);
  }

  public playDefend() {
    this.tone(300, 0.12, 'triangle', 0.06, 460);
    this.tone(520, 0.14, 'sine', 0.045, 580, 0.04);
  }

  public playEnemyHit() {
    this.tone(140, 0.11, 'square', 0.065, 60);
  }

  public playVictory() {
    this.tone(440, 0.1, 'triangle', 0.055);
    this.tone(554, 0.1, 'triangle', 0.055, undefined, 0.08);
    this.tone(659, 0.18, 'triangle', 0.06, undefined, 0.16);
  }

  public playStairs() {
    this.tone(330, 0.1, 'sine', 0.055, 440);
    this.tone(440, 0.12, 'sine', 0.055, 587, 0.08);
    this.tone(587, 0.18, 'sine', 0.055, 880, 0.16);
  }

  public playGameOver() {
    this.tone(280, 0.18, 'sawtooth', 0.06, 210);
    this.tone(200, 0.22, 'sawtooth', 0.06, 140, 0.16);
    this.tone(130, 0.35, 'sawtooth', 0.06, 65, 0.34);
  }
}

export const sound = new SoundEngine();
