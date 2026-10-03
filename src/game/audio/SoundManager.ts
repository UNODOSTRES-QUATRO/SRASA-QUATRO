export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Engine Synth (5-cylinder rumble)
  private engineSubOsc: OscillatorNode | null = null;
  private engineMidOsc: OscillatorNode | null = null;
  private engineHarmonicOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineBassShelf: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Turbocharger Spool Whine
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;

  // Wind Rush Synth
  private windNoiseNode: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  // Tire Skid Synth (dual-layer scrub & squeal)
  private tireNoiseNode: AudioBufferSourceNode | null = null;
  private tireFilter: BiquadFilterNode | null = null;
  private tireHighFilter: BiquadFilterNode | null = null;
  private tireGain: GainNode | null = null;

  // Ambient Synthwave / Lofi Pads
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientTimer: ReturnType<typeof setInterval> | null = null;
  private ambientArpTimer: ReturnType<typeof setInterval> | null = null;
  private currentChordIndex = 0;
  private activeVoices: { osc: OscillatorNode; gain: GainNode }[] = [];
  private subDroneOsc: OscillatorNode | null = null;
  private subDroneGain: GainNode | null = null;

  // Tape hiss / room tone
  private noiseGain: GainNode | null = null;

  private isInitialized = false;
  private isMuted = false;
  private isCinematic = false;
  private currentMode: "DRIVING" | "WALKING" | "COMBAT" = "WALKING";

  public ensureAudioContext() {
    if (typeof window === "undefined") return;
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().then(() => {
        if (this.activeVoices.length === 0) {
          this.playNextPadChord();
        }
      }).catch(() => {});
    }
  }

  public resumeAudio() {
    this.ensureAudioContext();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().then(() => {
        if (this.activeVoices.length === 0) {
          this.playNextPadChord();
        }
      }).catch(() => {});
    }
  }

  public init() {
    if (typeof window === "undefined") return;
    if (this.isInitialized) {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().then(() => {
          if (this.activeVoices.length === 0) {
            this.playNextPadChord();
          }
        }).catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      // Master Compressor & Gain for loud, clear, non-clipping audio
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(2.0, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // 1. 5-Cylinder Heavy Bass Engine Synth
      this.initEngineSynth();

      // 2. Continuous Tire Drift / Skid Synth
      this.initTireSkidSynth();

      // 3. High-Speed Aerodynamic Wind Rush Synth
      this.initWindRushSynth();

      // 4. Analog Tape Hiss / Ambient Air
      this.initTapeHiss();

      // 5. Procedural Ambient Synthwave / Lofi Pad Engine
      this.initAmbientPads();

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  private prevEngineSpeed = 0;
  private lastFlutterTime = 0;

  private initEngineSynth() {
    if (!this.ctx || !this.compressor) return;

    // Sub oscillator (heavy bass throb)
    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = "triangle";
    this.engineSubOsc.frequency.setValueAtTime(42, this.ctx.currentTime);

    // Mid oscillator (throaty 5-cylinder growl)
    this.engineMidOsc = this.ctx.createOscillator();
    this.engineMidOsc.type = "sawtooth";
    this.engineMidOsc.frequency.setValueAtTime(84, this.ctx.currentTime);

    // Harmonic 3rd order oscillator (syncopated burble)
    this.engineHarmonicOsc = this.ctx.createOscillator();
    this.engineHarmonicOsc.type = "sine";
    this.engineHarmonicOsc.frequency.setValueAtTime(126, this.ctx.currentTime);

    // Turbocharger spool whine
    this.turboOsc = this.ctx.createOscillator();
    this.turboOsc.type = "sine";
    this.turboOsc.frequency.setValueAtTime(1600, this.ctx.currentTime);
    this.turboGain = this.ctx.createGain();
    this.turboGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.compressor);
    this.turboOsc.start();

    // Warm resonant lowpass filter
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.setValueAtTime(360, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2.4, this.ctx.currentTime);

    // Dedicated sub-bass shelf boost for satisfying 5-cylinder rumble
    this.engineBassShelf = this.ctx.createBiquadFilter();
    this.engineBassShelf.type = "lowshelf";
    this.engineBassShelf.frequency.setValueAtTime(80, this.ctx.currentTime);
    this.engineBassShelf.gain.setValueAtTime(8.0, this.ctx.currentTime); // +8.0dB visceral bass boost

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    const midGain = this.ctx.createGain();
    midGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.engineMidOsc.connect(midGain);
    midGain.connect(this.engineFilter);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.engineHarmonicOsc.connect(harmGain);
    harmGain.connect(this.engineFilter);

    this.engineSubOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineBassShelf);
    this.engineBassShelf.connect(this.engineGain);
    this.engineGain.connect(this.compressor);

    this.engineSubOsc.start();
    this.engineMidOsc.start();
    this.engineHarmonicOsc.start();
  }

  private initTireSkidSynth() {
    if (!this.ctx || !this.compressor) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    this.tireNoiseNode = this.ctx.createBufferSource();
    this.tireNoiseNode.buffer = noiseBuffer;
    this.tireNoiseNode.loop = true;

    // Low bandpass for gritty asphalt scrub
    this.tireFilter = this.ctx.createBiquadFilter();
    this.tireFilter.type = "bandpass";
    this.tireFilter.frequency.setValueAtTime(850, this.ctx.currentTime);
    this.tireFilter.Q.setValueAtTime(2.8, this.ctx.currentTime);

    // High bandpass for rubber squeal friction
    this.tireHighFilter = this.ctx.createBiquadFilter();
    this.tireHighFilter.type = "bandpass";
    this.tireHighFilter.frequency.setValueAtTime(1750, this.ctx.currentTime);
    this.tireHighFilter.Q.setValueAtTime(4.2, this.ctx.currentTime);

    this.tireGain = this.ctx.createGain();
    this.tireGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.tireNoiseNode.connect(this.tireFilter);
    this.tireNoiseNode.connect(this.tireHighFilter);
    this.tireFilter.connect(this.tireGain);
    this.tireHighFilter.connect(this.tireGain);
    this.tireGain.connect(this.compressor);

    this.tireNoiseNode.start();
  }

  private initWindRushSynth() {
    if (!this.ctx || !this.compressor) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    this.windNoiseNode = this.ctx.createBufferSource();
    this.windNoiseNode.buffer = noiseBuffer;
    this.windNoiseNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "bandpass";
    this.windFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.windNoiseNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.compressor);

    this.windNoiseNode.start();
  }

  private initTapeHiss() {
    if (!this.ctx || !this.compressor) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.012;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(650, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.035, this.ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.compressor);

    whiteNoise.start();
  }

  // ── Procedural Ambient Synthwave / Lofi Pads ───────────────────────────────
  // Pentatonic & rich warm 9th/7th chords: Fmaj9 -> Dm9 -> Bbmaj9 -> C9sus -> Am9 -> Gm9 -> Ebmaj7 -> Abmaj9
  private static CHORD_PROGRESSION = [
    [174.61, 220.0, 261.63, 329.63, 392.0], // Fmaj9 (F3, A3, C4, E4, G4)
    [146.83, 220.0, 261.63, 293.66, 349.23], // Dm9 (D3, A3, C4, D4, F4)
    [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj9 (Bb2, F3, Bb3, D4, F4)
    [130.81, 196.0, 261.63, 293.66, 392.0], // C9sus (C3, G3, C4, D4, G4)
    [110.0, 164.81, 220.0, 261.63, 329.63], // Am9 (A2, E3, A3, C4, E4)
    [98.0, 146.83, 220.0, 261.63, 293.66], // Gm9 (G2, D3, A3, C4, D4)
    [155.56, 196.0, 233.08, 293.66, 349.23], // Ebmaj7 (Eb3, G3, Bb3, D4, F4)
    [103.83, 155.56, 207.65, 261.63, 311.13], // Abmaj9 (Ab2, Eb3, Ab3, C4, Eb4)
  ];

  private initAmbientPads() {
    if (!this.ctx || !this.compressor) return;

    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = "lowpass";
    this.ambientFilter.frequency.setValueAtTime(820, this.ctx.currentTime);
    this.ambientFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(1.15, this.ctx.currentTime);

    this.ambientFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.compressor);

    // Sub-drone warmth oscillator
    this.subDroneOsc = this.ctx.createOscillator();
    this.subDroneOsc.type = "sine";
    this.subDroneOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
    this.subDroneGain = this.ctx.createGain();
    this.subDroneGain.gain.setValueAtTime(0.38, this.ctx.currentTime);
    this.subDroneOsc.connect(this.subDroneGain);
    this.subDroneGain.connect(this.ambientFilter);
    this.subDroneOsc.start();

    // Analog LFO filter breathing (Juno-106 slow warmth)
    const padLfo = this.ctx.createOscillator();
    padLfo.type = "sine";
    padLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    const padLfoGain = this.ctx.createGain();
    padLfoGain.gain.setValueAtTime(115, this.ctx.currentTime);
    padLfo.connect(padLfoGain);
    padLfoGain.connect(this.ambientFilter.frequency);
    padLfo.start();

    // Play initial chord
    this.playNextPadChord();

    // Trigger next chord smoothly every 5.5 seconds with warm crossfade
    this.ambientTimer = setInterval(() => {
      if (!this.isMuted && !this.isCinematic) {
        this.playNextPadChord();
      }
    }, 5500);

    // Trigger gentle melodic bell chimes (warm Rhodes/Juno bell vibe)
    this.ambientArpTimer = setInterval(() => {
      if (!this.isMuted && !this.isCinematic && Math.random() < 0.72) {
        this.playAmbientBell();
      }
    }, 3800);
  }

  private playAmbientBell() {
    this.ensureAudioContext();
    if (!this.ctx || !this.ambientFilter || this.isMuted) return;

    const chord = SoundManager.CHORD_PROGRESSION[this.currentChordIndex];
    const randomFreq = chord[Math.floor(Math.random() * chord.length)] * 2;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(randomFreq, now);

    // Warm, dreamy bell chime with slow decaying tail
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.075, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(gain);
    gain.connect(this.ambientFilter);

    osc.start(now);
    osc.stop(now + 3.2);
  }

  private playNextPadChord() {
    this.ensureAudioContext();
    if (!this.ctx || !this.ambientFilter || this.isMuted) return;

    const chord = SoundManager.CHORD_PROGRESSION[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % SoundManager.CHORD_PROGRESSION.length;

    const now = this.ctx.currentTime;
    const fadeDuration = 3.6;

    // Gently ramp down old voices without Web Audio 0-value exponential ramp errors
    this.activeVoices.forEach(({ gain, osc }) => {
      try {
        const curVal = Math.max(0.0001, gain.gain.value);
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(curVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        }, fadeDuration * 1000);
      } catch {}
    });
    this.activeVoices = [];

    // Filter frequency sweep based on mode with gentle lofi breathing
    const baseFilterFreq = this.currentMode === "DRIVING" ? 1050 : this.currentMode === "COMBAT" ? 1350 : 860;
    this.ambientFilter.frequency.setTargetAtTime(baseFilterFreq, now, 1.6);

    // Update sub drone to root of chord
    if (this.subDroneOsc && this.ctx) {
      const rootFreq = chord[0] / 2;
      this.subDroneOsc.frequency.setTargetAtTime(rootFreq, now, 2.0);
    }

    // Spawn new chord voices with lush analog presence
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.ambientFilter) return;

      const osc = this.ctx.createOscillator();
      // Analog detuning for rich chorus vibe
      const detuneCents = (idx % 2 === 0 ? 1 : -1) * (5 + idx * 3.0);
      osc.type = idx === 0 ? "triangle" : idx === 1 ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      const gain = this.ctx.createGain();
      const targetVol = (1.15 / chord.length) * (idx === 0 ? 1.6 : idx === 1 ? 0.75 : 1.25);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(targetVol, now + fadeDuration * 0.7);

      osc.connect(gain);
      gain.connect(this.ambientFilter);

      osc.start(now);
      this.activeVoices.push({ osc, gain });
    });
  }

  public setMode(mode: "DRIVING" | "WALKING" | "COMBAT") {
    this.ensureAudioContext();
    this.currentMode = mode;
    if (!this.ctx || !this.ambientFilter || !this.ambientGain) return;

    const now = this.ctx.currentTime;
    if (mode === "DRIVING") {
      this.ambientGain.gain.setTargetAtTime(0.85, now, 0.5);
      this.ambientFilter.frequency.setTargetAtTime(950, now, 1.0);
    } else if (mode === "COMBAT") {
      this.ambientGain.gain.setTargetAtTime(1.10, now, 0.4);
      this.ambientFilter.frequency.setTargetAtTime(1250, now, 0.5);
    } else {
      this.ambientGain.gain.setTargetAtTime(1.15, now, 0.8);
      this.ambientFilter.frequency.setTargetAtTime(820, now, 1.2);
    }
  }

  private combatTimer: ReturnType<typeof setTimeout> | null = null;
  public triggerCombatStance() {
    if (this.currentMode === "DRIVING") return;
    this.setMode("COMBAT");
    if (this.combatTimer) clearTimeout(this.combatTimer);
    this.combatTimer = setTimeout(() => {
      if (this.currentMode === "COMBAT") {
        this.setMode("WALKING");
      }
    }, 7000);
  }

  // ── Engine & Drift Physics Updates ─────────────────────────────────────────
  public updateEngine(speed: number, isDriving: boolean = true) {
    this.ensureAudioContext();
    if (!this.ctx || !this.engineSubOsc || !this.engineMidOsc || !this.engineGain || this.isMuted) return;

    if (!isDriving) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      if (this.turboGain) this.turboGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      if (this.windGain) this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      return;
    }

    const absSpeed = Math.abs(speed);
    const accel = (absSpeed - this.prevEngineSpeed) / 0.05;
    this.prevEngineSpeed = absSpeed;

    // Detect high-speed throttle lift for turbo wastegate flutter
    const nowMs = performance.now();
    if (accel < -6.5 && absSpeed > 9.0 && nowMs - this.lastFlutterTime > 1500) {
      this.lastFlutterTime = nowMs;
      this.playTurboFlutter();
    }

    // Base 42Hz idle up to 175Hz high rev with throaty 5-cyl cadence
    const subFreq = 42 + (absSpeed / 28) * 133;
    const midFreq = subFreq * 2.15;
    const harmFreq = subFreq * 3.25;

    const now = this.ctx.currentTime;
    this.engineSubOsc.frequency.setTargetAtTime(subFreq, now, 0.05);
    this.engineMidOsc.frequency.setTargetAtTime(midFreq, now, 0.05);
    if (this.engineHarmonicOsc) {
      this.engineHarmonicOsc.frequency.setTargetAtTime(harmFreq, now, 0.05);
    }

    // Warm, heavy bass volume that scales with speed (punchy & satisfying)
    const engineVol = 0.65 + Math.min(1.0, absSpeed / 20) * 0.85;
    this.engineGain.gain.setTargetAtTime(this.isCinematic ? 0 : engineVol, now, 0.05);

    if (this.engineFilter) {
      const filterCutoff = 380 + (absSpeed / 28) * 920;
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.07);
    }

    // Turbocharger spool whine above 10 m/s
    if (this.turboOsc && this.turboGain) {
      if (absSpeed > 9.0) {
        const turboRatio = Math.min(1.0, (absSpeed - 9.0) / 16.0);
        this.turboOsc.frequency.setTargetAtTime(1400 + turboRatio * 1900, now, 0.08);
        this.turboGain.gain.setTargetAtTime(turboRatio * 0.12, now, 0.08);
      } else {
        this.turboGain.gain.setTargetAtTime(0, now, 0.1);
      }
    }

    // Speed-dependent wind rush
    if (this.windGain && this.windFilter) {
      if (absSpeed > 6.0) {
        const windRatio = Math.min(1.0, (absSpeed - 6.0) / 20.0);
        this.windGain.gain.setTargetAtTime(windRatio * 0.44, now, 0.08);
        this.windFilter.frequency.setTargetAtTime(450 + windRatio * 750, now, 0.08);
      } else {
        this.windGain.gain.setTargetAtTime(0, now, 0.1);
      }
    }
  }

  // Turbo wastegate flutter (compressor surge blow-off "tsu-tsu-tu")
  public playTurboFlutter() {
    this.ensureAudioContext();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    const pulses = [0, 0.045, 0.095, 0.15];
    pulses.forEach((offset, idx) => {
      if (!this.ctx || !this.compressor) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const startF = 1750 - idx * 220;
      osc.frequency.setValueAtTime(startF, now + offset);
      osc.frequency.exponentialRampToValueAtTime(startF * 0.55, now + offset + 0.04);

      const vol = 0.22 * Math.pow(0.72, idx);
      gain.gain.setValueAtTime(vol, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });
  }

  public updateTireDrift(driftFactor: number, speed: number) {
    this.ensureAudioContext();
    if (!this.ctx || !this.tireGain || !this.tireFilter || this.isMuted) return;

    const absSpeed = Math.abs(speed);
    if (driftFactor > 0.06 && absSpeed > 1.8) {
      const intensity = Math.min(1.0, (driftFactor - 0.06) * 2.2);
      const tireVol = intensity * 1.05;
      const targetFreq = 780 + intensity * 1050;

      const now = this.ctx.currentTime;
      this.tireGain.gain.setTargetAtTime(tireVol, now, 0.025);
      this.tireFilter.frequency.setTargetAtTime(targetFreq, now, 0.025);
      if (this.tireHighFilter) {
        this.tireHighFilter.frequency.setTargetAtTime(1650 + intensity * 1100, now, 0.025);
      }
    } else {
      this.tireGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  // Exhaust backfire pop on deceleration
  public playExhaustPop() {
    if (!this.ctx || !this.compressor || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.025));
    }

    const popSource = this.ctx.createBufferSource();
    popSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(420, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    popSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    popSource.start(now);
  }

  // ── Vehicle Mount & Dismount SFX ───────────────────────────────────────────
  public playVehicleMount() {
    this.ensureAudioContext();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Door latch thunk
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.16);

    // Ignition starter whirr
    setTimeout(() => {
      if (!this.ctx || !this.compressor || this.isMuted) return;
      const ignNow = this.ctx.currentTime;
      const ignOsc = this.ctx.createOscillator();
      const ignGain = this.ctx.createGain();
      ignOsc.type = "sawtooth";
      ignOsc.frequency.setValueAtTime(55, ignNow);
      ignOsc.frequency.exponentialRampToValueAtTime(110, ignNow + 0.22);
      ignGain.gain.setValueAtTime(0.12, ignNow);
      ignGain.gain.exponentialRampToValueAtTime(0.001, ignNow + 0.28);
      ignOsc.connect(ignGain);
      ignGain.connect(this.compressor);
      ignOsc.start(ignNow);
      ignOsc.stop(ignNow + 0.28);
    }, 120);
  }

  public playVehicleDismount() {
    this.ensureAudioContext();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Door opening latch click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // ── Weapon SFX: Crisp & Low-Cortisol ───────────────────────────────────────
  // Katana Whoosh with 3-hit fluid combo pitch scaling & Solfeggio harmonics
  public playSwordSlash(comboIndex: number = 0) {
    this.ensureAudioContext();
    this.triggerCombatStance();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * (comboIndex === 2 ? 0.32 : 0.22));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (comboIndex === 2 ? 0.95 : 0.8);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";

    // Combo-specific filter sweeps
    const startFreq = comboIndex === 0 ? 1200 : comboIndex === 1 ? 1550 : 1850;
    const endFreq = comboIndex === 0 ? 350 : comboIndex === 1 ? 520 : 280;
    const duration = comboIndex === 2 ? 0.30 : 0.20;

    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    filter.Q.setValueAtTime(comboIndex === 2 ? 5.0 : 4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(comboIndex === 2 ? 0.72 : 0.58, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.02);

    // High crystal blade sheen (tuned to Solfeggio 528Hz, 660Hz, 880Hz harmonic overtone)
    const sheenFreq = comboIndex === 0 ? 1760 : comboIndex === 1 ? 2112 : 2640;
    const sheen = this.ctx.createOscillator();
    const sheenGain = this.ctx.createGain();
    sheen.type = "sine";
    sheen.frequency.setValueAtTime(sheenFreq, now);
    sheen.frequency.exponentialRampToValueAtTime(sheenFreq * 0.58, now + duration * 0.9);
    sheenGain.gain.setValueAtTime(comboIndex === 2 ? 0.45 : 0.35, now);
    sheenGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);

    sheen.connect(sheenGain);
    sheenGain.connect(this.compressor);
    sheen.start(now);
    sheen.stop(now + duration * 0.9);

    // For combo 3 (finisher spin), add a rich low sub-harmonic punch (132Hz Solfeggio fundamental)
    if (comboIndex === 2) {
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = "triangle";
      sub.frequency.setValueAtTime(132, now);
      sub.frequency.exponentialRampToValueAtTime(66, now + 0.28);
      subGain.gain.setValueAtTime(0.38, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      sub.connect(subGain);
      subGain.connect(this.compressor);
      sub.start(now);
      sub.stop(now + 0.28);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(now);
  }

  // Bow String Draw & Release
  public playBowRelease() {
    this.ensureAudioContext();
    this.triggerCombatStance();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Resonant string twang
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.24);

    gain.gain.setValueAtTime(0.54, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(now);
    osc.stop(now + 0.26);

    // Arrow whistle
    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = "sine";
    whistle.frequency.setValueAtTime(880, now);
    whistle.frequency.linearRampToValueAtTime(1400, now + 0.15);
    whistleGain.gain.setValueAtTime(0.28, now);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    whistle.connect(whistleGain);
    whistleGain.connect(this.compressor);
    whistle.start(now);
    whistle.stop(now + 0.2);
  }

  // Void Pen Calligraphy Stroke
  public playInkStroke() {
    this.ensureAudioContext();
    this.triggerCombatStance();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Mystical resonant bell chime
    const notes = [659.25, 783.99, 1046.5]; // E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.compressor) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.22, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.65);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.65);
    });
  }

  // Harmonic Resonance Chime (on astral monster hit - meditative 528Hz Solfeggio bell)
  public playHarmonicChime() {
    this.ensureAudioContext();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Singing bowl warmth & Solfeggio overtones: 264Hz (root sub), 528Hz (heart), 792Hz (fifth), 1056Hz (octave)
    const freqs = [264.0, 528.0, 792.0, 1056.0];
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.compressor) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.02);

      gain.gain.setValueAtTime(0.001, now + i * 0.02);
      gain.gain.linearRampToValueAtTime(0.42 / (1 + i * 0.2), now + i * 0.02 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.02 + 1.8);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(now + i * 0.02);
      osc.stop(now + i * 0.02 + 1.8);
    });
  }

  // Harmonic Crystallization Dissolve (on astral monster defeat)
  public playCrystalShatter() {
    this.ensureAudioContext();
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Cascading gentle crystalline pentatonic bells (soothing & rewarding!)
    const crystalNotes = [528.0, 660.0, 880.0, 1056.0, 1320.0, 1584.0, 2112.0];
    crystalNotes.forEach((freq, i) => {
      if (!this.ctx || !this.compressor) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.001, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.38, now + i * 0.05 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 2.0);

      osc.connect(gain);
      gain.connect(this.compressor);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 2.0);
    });
  }

  // ── Existing Routine & Story SFX ───────────────────────────────────────────
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 2.0, this.ctx.currentTime, 0.05);
    }
  }

  public setCinematicMode(enabled: boolean) {
    this.isCinematic = enabled;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.engineGain) this.engineGain.gain.setTargetAtTime(enabled ? 0 : 0.08, now, 0.5);
    if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(enabled ? 0.95 : 0.85, now, 0.5);
  }

  public playEndingChime() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    [659.25, 880, 1174.66].forEach((frequency, index) => {
      const oscillator = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = this.ctx!.currentTime + index * 0.22;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.2);
      oscillator.connect(gain);
      gain.connect(this.compressor!);
      oscillator.start(startTime);
      oscillator.stop(startTime + 2.2);
    });
  }

  public playClick() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playPurr() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(28, this.ctx.currentTime);
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(24, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfo.connect(lfoGain.gain);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.compressor);
    lfo.start();
    osc.start();
    lfo.stop(this.ctx.currentTime + 1.2);
    osc.stop(this.ctx.currentTime + 1.2);
  }

  public playMeow() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(820, this.ctx.currentTime + 0.18);
    osc.frequency.exponentialRampToValueAtTime(460, this.ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  public playDoorOpen() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playDoorSlam() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playWater() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.8);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    whiteNoise.start();
  }

  public playCook() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    whiteNoise.start();
  }

  public playEat() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(330, this.ctx.currentTime);
    osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(554, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playFootstep() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Low solid foot thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(95 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.07);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(now + 0.07);

    // Subtle road/gravel friction crunch
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.0, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.compressor);
    noise.start(now);
  }

  public playKeyPickup() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const notes = [587.33, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.compressor!);
      osc.start(this.ctx!.currentTime + idx * 0.08);
      osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.4);
    });
  }

  public playBugCatch() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playPortalWhoosh() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, this.ctx.currentTime + 0.8);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 1.4);
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.4);
  }

  public playKeyboardType() {
    if (!this.ctx || !this.compressor || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }
}

export const soundManager = new SoundManager();
