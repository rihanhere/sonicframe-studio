'use client';

import React from 'react';
import Link from 'next/link';
import { AudioVersion, StudioComment } from '@/types/studio';
import { VERSION_METADATA } from '@/lib/mockData';
import {
  SlidersHorizontal,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronLeft,
  Volume2,
} from 'lucide-react';

interface StudioHeaderProps {
  version: AudioVersion;
  onVersionChange: (v: AudioVersion) => void;
  comments: StudioComment[];
  onExportReaperCSV: () => void;
  isApproved: boolean;
  onToggleApprove: () => void;
  isPlaying: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  version,
  onVersionChange,
  comments,
  onExportReaperCSV,
  isApproved,
  onToggleApprove,
  isPlaying,
}) => {
  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  const currentMeta = VERSION_METADATA[version];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Project Brand, Title & Format Badges */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Back to Studio Home"
          >
            <ChevronLeft className="w-5 h-5" />
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-black text-xs shadow-md shadow-orange-500/20">
              SF
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-semibold text-zinc-100 text-sm md:text-base tracking-tight flex items-center gap-2">
                Episode 04 — Final Surround &amp; Foley Mix
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800/90 text-amber-400 border border-amber-500/20">
                48kHz / 24-Bit WAV
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                5.1 SURROUND
              </span>
              {isPlaying && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  AUDIO ENGINE ACTIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 font-mono">
              <span className="flex items-center gap-1 text-zinc-500">
                Target: <span className="text-zinc-300 font-semibold">{currentMeta.lufs}</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-500">
                True Peak: <span className="text-zinc-300 font-semibold">{currentMeta.peak}</span>
              </span>
              <span className="text-zinc-600 hidden md:inline">•</span>
              <span className="text-zinc-500 hidden md:inline">
                Spec: <span className="text-zinc-400">{currentMeta.sublabel}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Version Switcher, REAPER Export & Approve Button */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* A/B Version Switcher */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 shadow-inner">
            <button
              onClick={() => onVersionChange('v1')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                version === 'v1'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${version === 'v1' ? 'bg-amber-400 ring-2 ring-amber-400/20' : 'bg-zinc-600'}`} />
              v1 Rough Cut
              <span className="text-[10px] text-zinc-500 ml-0.5">-18.4 LUFS</span>
            </button>

            <button
              onClick={() => onVersionChange('v2')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                version === 'v2'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 shadow-sm border border-amber-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${version === 'v2' ? 'bg-orange-400 ring-2 ring-orange-400/20 animate-pulse' : 'bg-zinc-600'}`} />
              v2 Loudness Matched
              <span className="text-[10px] text-amber-400/80 ml-0.5">-14.1 LUFS</span>
            </button>
          </div>

          {/* Export REAPER Markers Button */}
          <button
            onClick={onExportReaperCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-zinc-600 transition-colors shadow-sm"
            title="Download Cockos REAPER Marker CSV (#, Name, Start, End, Length, Color)"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export REAPER Markers (.CSV)</span>
            {unresolvedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {unresolvedCount}
              </span>
            )}
          </button>

          {/* Approve Deliverable Status Button */}
          <button
            onClick={onToggleApprove}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
              isApproved
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold ring-2 ring-emerald-500/30 shadow-emerald-950/40'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 hover:border-emerald-500/50'
            }`}
          >
            {isApproved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>Deliverable Approved</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400" />
                <span>Approve Deliverable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
