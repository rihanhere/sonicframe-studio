export type CommentTag = 'MIX' | 'FOLEY' | 'BGM' | 'DIALOGUE';

export type AudioVersion = 'v1' | 'v2';

export interface StudioComment {
  id: string;
  timeMs: number;
  author: string;
  avatarUrl?: string;
  role: 'Director' | 'Mix Engineer' | 'Showrunner' | 'Sound Supervisor' | 'Client' | 'Re-recording Mixer';
  text: string;
  tag: CommentTag;
  resolved: boolean;
  version: AudioVersion;
  createdAt: string;
}

export interface AudioVersionData {
  id: AudioVersion;
  label: string;
  sublabel: string;
  lufs: string;
  peak: string;
  durationMs: number;
  sampleRate: string;
  bitDepth: string;
  channels: string;
  toneBaseFreq: number;
  gain: number;
}

export interface MarkerCSVRow {
  index: string;
  name: string;
  start: string;
  end: string;
  length: string;
  color: string;
}
