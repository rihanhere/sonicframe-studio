import { AudioVersion } from '@/types/studio';

// Generate deterministic 140 bar peak values for v1 and v2
export function generateWaveformBars(barCount: number = 140): { v1: number[]; v2: number[] } {
  const v1: number[] = [];
  const v2: number[] = [];

  for (let i = 0; i < barCount; i++) {
    const t = i / barCount;
    // Base musical arc: Intro (low) -> Verse (mid) -> Pre-chorus/Buildup -> Drop/Climax -> Breakdown -> Outro
    const arc =
      Math.sin(t * Math.PI) * 0.45 +
      Math.sin(t * Math.PI * 4) * 0.2 +
      Math.cos(t * Math.PI * 8) * 0.12;

    // Pseudo-random pseudo-deterministic noise based on sine hashing
    const hash = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const noise = hash - Math.floor(hash);

    // v1: Rough cut - wilder dynamics, some uncompressed peaks, some quiet valleys
    let rawV1 = Math.max(0.12, Math.min(0.98, arc * 0.75 + noise * 0.42));
    // Occasional unmastered spikes
    if (i % 17 === 0) rawV1 = Math.min(1.0, rawV1 * 1.35);
    if (i % 23 === 0) rawV1 = Math.max(0.08, rawV1 * 0.4);

    // v2: Loudness matched - compressed dynamic range, punchier mid-lows, polished brickwall ceiling
    let rawV2 = Math.max(0.24, Math.min(0.94, arc * 0.82 + noise * 0.28 + 0.16));
    // Polished contouring
    rawV2 = Math.pow(rawV2, 0.85);

    v1.push(parseFloat(rawV1.toFixed(3)));
    v2.push(parseFloat(rawV2.toFixed(3)));
  }

  return { v1, v2 };
}

// Format milliseconds into SMPTE display: MM:SS.ms (e.g. 01:23.450)
export function formatSMPTETimecode(ms: number): string {
  const totalSeconds = Math.max(0, ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor(ms % 1000);

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  const mmm = milliseconds.toString().padStart(3, '0');

  return `${mm}:${ss}.${mmm}`;
}

// Format for REAPER CSV markers: HH:MM:SS.mmm
export function formatReaperTimecode(ms: number): string {
  const totalSeconds = Math.max(0, ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor(ms % 1000);

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  const mmm = milliseconds.toString().padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}
