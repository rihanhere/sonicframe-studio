import { AudioVersion } from '@/types/studio';

class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private subOsc: OscillatorNode | null = null;
  private currentVersion: AudioVersion = 'v1';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public setVersion(version: AudioVersion) {
    this.currentVersion = version;
    if (!this.ctx || !this.filterNode || !this.masterGain) return;

    const now = this.ctx.currentTime;
    if (version === 'v1') {
      // v1 Rough Cut: Thinner, filtered at 1800Hz, lower level
      this.filterNode.frequency.setTargetAtTime(1800, now, 0.1);
      this.filterNode.Q.setTargetAtTime(1.0, now, 0.1);
      if (this.isPlaying) {
        this.masterGain.gain.setTargetAtTime(0.14, now, 0.1);
      }
    } else {
      // v2 Loudness Matched: Open up to 6500Hz, richer harmonic bloom, matched broadcast loudness
      this.filterNode.frequency.setTargetAtTime(6200, now, 0.1);
      this.filterNode.Q.setTargetAtTime(2.2, now, 0.1);
      if (this.isPlaying) {
        this.masterGain.gain.setTargetAtTime(0.24, now, 0.1);
      }
    }
  }

  public play(version: AudioVersion = this.currentVersion) {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.currentVersion = version;
    const now = this.ctx.currentTime;

    // Master bus chain: Oscs -> Filter -> Analyser -> Master Gain -> Destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(version === 'v1' ? 1800 : 6200, now);
    this.filterNode.Q.setValueAtTime(version === 'v1' ? 1.0 : 2.2, now);

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.filterNode.connect(this.analyserNode);
    this.analyserNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Warm cinematic ambient reference chord: D minor 9th (D2, A2, F3, C4, E4)
    // Studio reference tone frequencies (Hz)
    const freqs = [
      73.42,   // D2 (warm root foundation)
      110.00,  // A2 (fifth)
      174.61,  // F3 (minor third)
      261.63,  // C4 (seventh)
      329.63,  // E4 (ninth shimmer)
    ];

    this.oscillators = [];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.filterNode) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Alternate warm sine and gentle triangle
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Subtle micro-detuning for lush stereo chorus warmth
      const detune = (idx - 2) * 5.5;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      // Relative balance between root warmth and high harmonics
      const level = idx === 0 ? 0.35 : idx === 1 ? 0.28 : 0.18;
      oscGain.gain.setValueAtTime(level, now);

      osc.connect(oscGain);
      oscGain.connect(this.filterNode);
      osc.start(now);
      this.oscillators.push(osc);
    });

    // Sub-bass layer for tactile low-end monitor feeling
    this.subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(36.71, now); // D1 deep sub
    subGain.gain.setValueAtTime(0.2, now);
    this.subOsc.connect(subGain);
    subGain.connect(this.filterNode);
    this.subOsc.start(now);

    // Fade in to prevent transducer pop
    const targetGain = version === 'v1' ? 0.14 : 0.24;
    this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.12);

    this.isPlaying = true;
  }

  public pause() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Smooth ramp down before stopping nodes
    this.masterGain.gain.setTargetAtTime(0.0001, now, 0.04);

    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      this.oscillators = [];

      if (this.subOsc) {
        try {
          this.subOsc.stop();
          this.subOsc.disconnect();
        } catch {
          // ignore
        }
        this.subOsc = null;
      }

      this.isPlaying = false;
    }, 80);
  }

  public stop() {
    this.pause();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const studioAudio = new StudioAudioEngine();
