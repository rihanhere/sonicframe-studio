'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Maximize2,
  Sliders,
  Check,
  Tag,
  Flame,
} from 'lucide-react';
import { AudioVersion, StudioComment, CommentTag } from '@/types/studio';
import { formatSMPTETimecode } from '@/lib/waveformGenerator';
import { TOTAL_DURATION_MS } from '@/lib/mockData';
import { studioAudio } from '@/lib/audioEngine';

interface WaveformTimelineProps {
  version: AudioVersion;
  barsV1: number[];
  barsV2: number[];
  comments: StudioComment[];
  activeCommentId: string | null;
  onSelectComment: (id: string) => void;
  playheadMs: number;
  onSeek: (ms: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const TAG_STYLES: Record<CommentTag, { bg: string; text: string; border: string; glow: string }> = {
  MIX: {
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500',
    glow: 'shadow-amber-500/50',
  },
  FOLEY: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-500/50',
  },
  BGM: {
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/50',
  },
  DIALOGUE: {
    bg: 'bg-cyan-500',
    text: 'text-cyan-400',
    border: 'border-cyan-500',
    glow: 'shadow-cyan-500/50',
  },
};

export const WaveformTimeline: React.FC<WaveformTimelineProps> = ({
  version,
  barsV1,
  barsV2,
  comments,
  activeCommentId,
  onSelectComment,
  playheadMs,
  onSeek,
  isPlaying,
  onTogglePlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverMs, setHoverMs] = useState<number | null>(null);
  const [hoverComment, setHoverComment] = useState<StudioComment | null>(null);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [vuLevels, setVuLevels] = useState<number[]>([42, 68, 55, 30, 48, 51]);

  const bars = version === 'v1' ? barsV1 : barsV2;

  // Real-time VU meter jitter simulation when playing
  useEffect(() => {
    if (!isPlaying) {
      setVuLevels([0, 0, 0, 0, 0, 0]);
      return;
    }
    const interval = setInterval(() => {
      const base = version === 'v2' ? 75 : 55;
      setVuLevels([
        Math.min(98, Math.max(15, base + (Math.random() * 26 - 13))),
        Math.min(99, Math.max(20, base + 5 + (Math.random() * 22 - 11))),
        Math.min(96, Math.max(15, base + (Math.random() * 26 - 13))),
        Math.min(90, Math.max(10, base - 12 + (Math.random() * 30 - 15))), // LFE
        Math.min(92, Math.max(12, base - 8 + (Math.random() * 24 - 12))),
        Math.min(92, Math.max(12, base - 8 + (Math.random() * 24 - 12))),
      ]);
    }, 90);
    return () => clearInterval(interval);
  }, [isPlaying, version]);

  // Handle waveform click or drag seek
  const handleSeekFromEvent = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      const targetMs = Math.round(percentage * TOTAL_DURATION_MS);
      onSeek(targetMs);
    },
    [onSeek]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const hoverX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = hoverX / rect.width;
    setHoverMs(Math.round(percentage * TOTAL_DURATION_MS));
  }, []);

  const handleMouseLeave = () => {
    setHoverMs(null);
  };

  const playheadPercent = Math.min(100, Math.max(0, (playheadMs / TOTAL_DURATION_MS) * 100));

  // Time ruler notches (every 15 seconds)
  const rulerMarks = [
    { ms: 0, label: '00:00' },
    { ms: 15000, label: '00:15' },
    { ms: 30000, label: '00:30' },
    { ms: 45000, label: '00:45' },
    { ms: 60000, label: '01:00' },
    { ms: 75000, label: '01:15' },
    { ms: 90000, label: '01:30' },
    { ms: 105000, label: '01:45' },
  ];

  return (
    <div className="flex flex-col bg-zinc-950 border-b border-zinc-800 p-4 select-none">
      {/* Top Monitor Deck: Live SMPTE Timecode & Audio Engine Readout */}
      <div className="flex items-center justify-between mb-3 px-2 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* SMPTE Digital Readout */}
          <div className="bg-black/90 border border-zinc-800 rounded-lg px-3.5 py-1.5 shadow-inner flex items-baseline gap-2">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">SMPTE TC</span>
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.25)]">
              {formatSMPTETimecode(playheadMs)}
            </span>
            <span className="text-[11px] font-mono text-zinc-600">
              / {formatSMPTETimecode(TOTAL_DURATION_MS)}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              24 FPS
            </span>
          </div>

          {/* Active Version Monitor Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs">
            <span className="text-zinc-500">Monitoring Bus:</span>
            <span className="font-semibold text-zinc-200">
              {version === 'v1' ? 'v1 (Pre-Master)' : 'v2 (EBU R128 Matched)'}
            </span>
          </div>
        </div>

        {/* 5.1 Surround Level Meters */}
        <div className="flex items-center gap-2 bg-black/80 border border-zinc-800/90 rounded-lg px-3 py-1.5">
          <div className="text-[10px] font-mono text-zinc-500 font-semibold tracking-wider mr-1">5.1 PEAK</div>
          {['L', 'C', 'R', 'LFE', 'Ls', 'Rs'].map((ch, idx) => (
            <div key={ch} className="flex flex-col items-center gap-1 w-3 sm:w-3.5">
              <div className="h-6 w-full bg-zinc-900 rounded-sm overflow-hidden flex flex-col justify-end p-0.5">
                <div
                  className={`w-full rounded-xs transition-all duration-75 ${
                    vuLevels[idx] > 88
                      ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : vuLevels[idx] > 70
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ height: `${isPlaying ? vuLevels[idx] : 4}%` }}
                />
              </div>
              <span className="text-[9px] font-mono text-zinc-500">{ch}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Waveform Canvas & Flag Pins Container */}
      <div className="relative group bg-zinc-900/40 border border-zinc-800/90 rounded-xl p-3 shadow-2xl backdrop-blur-sm">
        {/* Time ruler bar at top of waveform */}
        <div className="relative h-5 mb-1.5 border-b border-zinc-800/70 text-[10px] font-mono text-zinc-500">
          {rulerMarks.map((m) => {
            const pct = (m.ms / TOTAL_DURATION_MS) * 100;
            return (
              <div
                key={m.ms}
                className="absolute top-0 flex flex-col items-start transform -translate-x-1/2"
                style={{ left: `${pct}%` }}
              >
                <div className="h-1.5 w-[1px] bg-zinc-700" />
                <span className="text-[10px] text-zinc-500 select-none mt-0.5">{m.label}</span>
              </div>
            );
          })}
        </div>

        {/* The 140-Bar Waveform Timeline */}
        <div
          ref={containerRef}
          onClick={handleSeekFromEvent}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-28 w-full cursor-crosshair flex items-center justify-between gap-[1px] sm:gap-[2px] py-1"
        >
          {/* Subtle Background Centerline */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-zinc-800/60 pointer-events-none" />

          {/* 140 Bars */}
          {bars.map((peak, index) => {
            const barPercent = (index / (bars.length - 1)) * 100;
            const isPassed = barPercent <= playheadPercent;

            // Height scaling: mirror wave above and below center
            const heightPercent = Math.max(8, peak * 92);

            return (
              <div
                key={index}
                className="h-full flex-1 flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
              >
                <div
                  className={`w-full max-w-[5px] rounded-full transition-all duration-300 ${
                    isPassed
                      ? version === 'v2'
                        ? 'bg-gradient-to-t from-amber-500 via-orange-400 to-amber-300 shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-200 shadow-[0_0_3px_rgba(255,255,255,0.2)]'
                      : 'bg-zinc-700/60 hover:bg-zinc-600'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    opacity: isPassed ? 1 : 0.45,
                  }}
                />
              </div>
            );
          })}

          {/* Hover Ghost Scrubber */}
          {hoverMs !== null && (
            <div
              className="absolute top-0 bottom-0 w-[1px] bg-zinc-400/50 pointer-events-none z-10"
              style={{ left: `${(hoverMs / TOTAL_DURATION_MS) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700 shadow-md whitespace-nowrap">
                {formatSMPTETimecode(hoverMs)}
              </div>
            </div>
          )}

          {/* Live 60fps Playhead Line with Glowing Head */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-300 via-orange-400 to-amber-500 pointer-events-none z-20 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
            style={{ left: `${playheadPercent}%` }}
          >
            {/* Playhead Top Needle */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-amber-400 rotate-45 rounded-xs shadow-lg border border-black" />
            {/* Playhead Bottom Bead */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400" />
          </div>

          {/* Pin Flags Rendered at Exact Milliseconds */}
          {comments.map((comment) => {
            const pinPercent = (comment.timeMs / TOTAL_DURATION_MS) * 100;
            const isSelected = activeCommentId === comment.id;
            const style = TAG_STYLES[comment.tag] || TAG_STYLES.MIX;

            return (
              <div
                key={comment.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(comment.timeMs);
                  onSelectComment(comment.id);
                }}
                onMouseEnter={() => setHoverComment(comment)}
                onMouseLeave={() => setHoverComment(null)}
                className="absolute top-0 bottom-0 z-30 flex flex-col items-center cursor-pointer group/pin"
                style={{ left: `${pinPercent}%` }}
                title={`${comment.tag}: ${comment.text}`}
              >
                {/* Thin vertical marker guide */}
                <div
                  className={`w-[1px] h-full transition-opacity ${
                    isSelected ? 'bg-amber-400' : 'bg-zinc-700/80 group-hover/pin:bg-zinc-400'
                  }`}
                />

                {/* Pin Flag at Top */}
                <div
                  className={`absolute -top-3.5 transform -translate-x-1/2 flex items-center justify-center transition-all ${
                    isSelected ? 'scale-125 z-40' : 'group-hover/pin:scale-115'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-black shadow-md border ${
                      comment.resolved
                        ? 'bg-zinc-700 border-zinc-600 text-zinc-300 opacity-80'
                        : `${style.bg} border-white/20 text-black ${style.glow}`
                    }`}
                  >
                    {comment.resolved ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span>{comment.tag.slice(0, 1)}</span>
                    )}
                  </div>
                </div>

                {/* Hover Tooltip Popup */}
                {hoverComment?.id === comment.id && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-56 p-2 rounded-lg bg-zinc-950 border border-zinc-700 shadow-2xl z-50 pointer-events-none">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${style.bg} text-black`}>
                        {comment.tag}
                      </span>
                      <span className="font-mono text-zinc-400">
                        {formatSMPTETimecode(comment.timeMs)}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-200 font-medium line-clamp-2">
                      {comment.text}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 flex items-center justify-between">
                      <span>{comment.author}</span>
                      <span>{comment.resolved ? '✓ Resolved' : '● Open'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="flex items-center justify-between mt-3 px-2 flex-wrap gap-3">
        {/* Transport Buttons: Rewind, Skip -5s, Play/Pause, Skip +5s, Loop */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rewind to Start */}
          <button
            onClick={() => onSeek(0)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            title="Rewind to start (00:00)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Jump Backward 5s */}
          <button
            onClick={() => onSeek(Math.max(0, playheadMs - 5000))}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            title="Jump back 5s"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play / Pause Button with Web Audio Reference Tone */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center justify-center w-11 h-11 rounded-xl font-bold transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/30'
                : 'bg-zinc-100 hover:bg-white text-black shadow-white/10'
            }`}
            title="Play / Pause reference mix tone (Spacebar)"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Jump Forward 5s */}
          <button
            onClick={() => onSeek(Math.min(TOTAL_DURATION_MS, playheadMs + 5000))}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            title="Jump forward 5s"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Loop Toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-lg transition-colors ${
              isLooping ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Seamless Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Engine Live Audio Synthesis Notice */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-[11px] font-mono text-zinc-400">
              Web Audio Synthesizer: <strong className="text-zinc-200">D minor 9th Ambient Drone</strong>
            </span>
          </div>
          <span className="hidden sm:inline-block text-zinc-600">|</span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
            [Space] Play/Pause • [Click Timeline] Scrub
          </span>
        </div>
      </div>
    </div>
  );
};
