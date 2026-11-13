'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Headphones,
  Radio,
  Layers,
  Clock,
  CheckCircle2,
  Play,
  Volume2,
  UploadCloud,
  Cpu,
  Database,
  Terminal,
  Zap,
  Flame,
} from 'lucide-react';
import { UploadMasterModal } from '@/components/UploadMasterModal';

export default function Home() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b0a_1px,transparent_1px),linear-gradient(to_bottom,#18181b0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-sm shadow-md shadow-orange-500/20">
              SF
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">SonicFrame</span>
              <span className="text-[10px] font-mono text-amber-400 ml-1.5 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                STUDIO v2.4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct S3 Upload</span>
            </button>

            <Link
              href="/review/demo"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Launch Live Demo Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-6 shadow-inner backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-amber-400 font-semibold tracking-wide">
            FRAME-ACCURATE CLOUD AUDIO REVIEW
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">DAW Marker Synchronization</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          SonicFrame — Audio Review &amp; DAW Sync for{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            Post-Production
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mb-8 leading-relaxed font-normal">
          Stop emailing MP3 bounces with vague timestamp bullet points. Pin millisecond-precise mix revisions directly onto 140-bar waveforms, A/B toggle pre-master vs loudness-matched versions, and export directly into Cockos REAPER markers in one click.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-16 w-full sm:w-auto">
          <Link
            href="/review/demo"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-sm transition-all shadow-xl shadow-amber-500/25 ring-2 ring-amber-400/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live Demo Studio (No Login Required)</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-medium text-sm transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <span>Upload Master WAV Modal</span>
          </button>
        </div>

        {/* Interactive Workspace Live Demo Preview */}
        <div className="w-full max-w-5xl rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left mb-20 group">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-xs text-zinc-300 font-medium ml-2">
                Session: Episode 04 — Final Surround &amp; Foley Mix
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 border border-amber-500/20">
                48kHz / 24-Bit WAV
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              <Clock className="w-3.5 h-3.5" />
              <span>00:14.250 SMPTE</span>
            </div>
          </div>

          {/* Mini Interactive Waveform Teaser */}
          <Link href="/review/demo" className="block relative group/wave">
            <div className="h-24 w-full flex items-center justify-between gap-[2px] py-2 bg-black/80 rounded-xl px-4 border border-zinc-800 mb-6 group-hover/wave:border-amber-500/40 transition-colors">
              {Array.from({ length: 110 }).map((_, i) => {
                const h = Math.max(14, Math.sin((i / 110) * Math.PI) * 78 + ((i * 11) % 22));
                const isPast = i < 35;
                return (
                  <div
                    key={i}
                    className={`w-full rounded-full transition-all ${
                      isPast
                        ? 'bg-gradient-to-t from-amber-500 via-orange-400 to-amber-300 shadow-[0_0_4px_rgba(245,158,11,0.25)]'
                        : 'bg-zinc-800 group-hover/wave:bg-zinc-700'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}

              {/* Sample Pin Flags */}
              <div className="absolute top-1 left-[28%] -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-bold text-[9px] shadow-sm">
                  MIX
                </span>
                <div className="w-[1px] h-12 bg-amber-500/80" />
              </div>
              <div className="absolute top-1 left-[62%] -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black font-bold text-[9px] shadow-sm">
                  FOLEY
                </span>
                <div className="w-[1px] h-12 bg-emerald-500/80" />
              </div>
            </div>

            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center opacity-0 group-hover/wave:opacity-100 transition-opacity">
              <span className="px-4 py-2 rounded-lg bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-xl">
                <Play className="w-3.5 h-3.5 fill-current" />
                Click to Open Full Interactive Studio
              </span>
            </div>
          </Link>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
              <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                A/B Loudness Stacking
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Toggle v1 Rough Cut (-18.4 LUFS) vs v2 Broadcast (-14.1 LUFS) with seamless Web Audio synthesis.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
              <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Department Flag Pins
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Color-coded markers for MIX (Amber), FOLEY (Emerald), BGM (Purple), and DIALOGUE (Cyan).
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
              <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                REAPER Native Export
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Downloads Cockos REAPER-formatted CSV markers with exact SMPTE timecodes and colors.
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid: Engineering Highlights */}
        <div className="w-full max-w-5xl text-left mb-20">
          <div className="mb-8">
            <span className="text-xs font-mono font-semibold uppercase text-amber-400 tracking-wider">
              Architecture &amp; Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Engineered for Precision Audio Workflows
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bento 1: Large Span 2 */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  A/B Loudness-Matched Version Stacking
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-4">
                  Audio engineers frequently battle client cognitive bias: louder versions sound psychoacoustically "better". SonicFrame normalizes both rough cuts and loudness-matched masters to EBU R128 and ITU-R BS.1770 standards, enabling genuine objective auditioning.
                </p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500 pt-3 border-t border-zinc-850">
                <span className="text-amber-400 font-semibold">-14.1 LUFS Integrated</span>
                <span>•</span>
                <span>-1.0 dBFS True Peak</span>
                <span>•</span>
                <span>5.1 LFE Alignment</span>
              </div>
            </div>

            {/* Bento 2: S3 / Wasabi Presigned Upload */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Direct Wasabi / S3 Streaming</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Multi-gigabyte 5.1 surround WAV files stream directly to and from object storage using native Node.js HMAC-SHA256 SigV4 presigned URLs without loading application servers.
                </p>
              </div>
              <div className="font-mono text-[11px] text-zinc-500 pt-3 border-t border-zinc-850">
                Zero Heavy SDK Overhead
              </div>
            </div>

            {/* Bento 3: REAPER CSV Marker Integration */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">One-Click REAPER CSV Export</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Instant export into standard REAPER Region/Marker format (<code className="text-zinc-300 font-mono">#, Name, Start, End, Length, Color</code>). Drag straight into your DAW session.
                </p>
              </div>
              <div className="font-mono text-[11px] text-zinc-500 pt-3 border-t border-zinc-850">
                Cockos REAPER Native
              </div>
            </div>

            {/* Bento 4: Large Span 2 */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  60fps SMPTE Playhead &amp; Web Audio Engine
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xl mb-4">
                  Runs a silky-smooth 60fps <code className="text-amber-400 font-mono">requestAnimationFrame</code> loop displaying millisecond timecode. Synthesizes a warm polyphonic ambient chord in real time so review rooms can audition immediately without waiting for downloads.
                </p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500 pt-3 border-t border-zinc-850">
                <span className="text-emerald-400 font-semibold">24 FPS SMPTE Timecode</span>
                <span>•</span>
                <span>Web Audio Harmonic Synthesis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="w-full max-w-5xl rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 p-8 text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Experience the Future of Audio Client Review
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
            Jump directly into the interactive Episode 04 session with preloaded director revisions, 140-bar waveform peaks, and REAPER CSV export.
          </p>
          <Link
            href="/review/demo"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live Demo Studio (/review/demo)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 py-8 px-4 text-center text-xs font-mono text-zinc-500">
        SonicFrame Studio • Professional Audio &amp; Post-Production Review Infrastructure
      </footer>

      {/* Upload Master Modal */}
      <UploadMasterModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
