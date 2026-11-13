'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudioHeader } from '@/components/StudioHeader';
import { WaveformTimeline } from '@/components/WaveformTimeline';
import { CommentInputBar } from '@/components/CommentInputBar';
import { RevisionQueue } from '@/components/RevisionQueue';
import { AudioVersion, StudioComment } from '@/types/studio';
import { generateWaveformBars } from '@/lib/waveformGenerator';
import {
  INITIAL_COMMENTS,
  TOTAL_DURATION_MS,
  VERSION_METADATA,
} from '@/lib/mockData';
import { studioAudio } from '@/lib/audioEngine';
import { downloadReaperCSV } from '@/lib/reaperExport';
import {
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  Volume2,
} from 'lucide-react';

export default function StudioReviewDemoPage() {
  const [version, setVersion] = useState<AudioVersion>('v2');
  const [playheadMs, setPlayheadMs] = useState<number>(14250); // Start at first revision note
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [comments, setComments] = useState<StudioComment[]>(INITIAL_COMMENTS);
  const [activeCommentId, setActiveCommentId] = useState<string | null>('c-1');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: 'success' | 'info';
  } | null>(null);

  // Deterministic 140 bars generated once
  const waveformRef = useRef<{ v1: number[]; v2: number[] } | null>(null);
  if (!waveformRef.current) {
    waveformRef.current = generateWaveformBars(140);
  }
  const { v1: barsV1, v2: barsV2 } = waveformRef.current;

  // 60fps RequestAnimationFrame Playhead loop
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const playheadRef = useRef<number>(playheadMs);
  playheadRef.current = playheadMs;

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        studioAudio.play(version);
      } else {
        studioAudio.pause();
      }
      return next;
    });
  }, [version]);

  // Handle version switcher
  const handleVersionChange = (newVersion: AudioVersion) => {
    setVersion(newVersion);
    studioAudio.setVersion(newVersion);
    setToastMessage({
      title: `Switched to ${VERSION_METADATA[newVersion].label}`,
      description: `Target: ${VERSION_METADATA[newVersion].lufs} | Peak: ${VERSION_METADATA[newVersion].peak} (${VERSION_METADATA[newVersion].sublabel})`,
      type: 'info',
    });
  };

  // 60fps requestAnimationFrame loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      let nextMs = playheadRef.current + delta;
      if (nextMs >= TOTAL_DURATION_MS) {
        nextMs = 0; // Seamless loop
      }

      setPlayheadMs(nextMs);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Global spacebar shortcut for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setPlayheadMs((prev) => Math.max(0, prev - 1000));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setPlayheadMs((prev) => Math.min(TOTAL_DURATION_MS, prev + 1000));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay]);

  // Clean up audio engine on unmount
  useEffect(() => {
    return () => {
      studioAudio.stop();
    };
  }, []);

  // Handle Seek
  const handleSeek = (targetMs: number) => {
    setPlayheadMs(targetMs);
  };

  // Add Comment
  const handleAddComment = (newCommentData: Omit<StudioComment, 'id' | 'createdAt'>) => {
    const newComment: StudioComment = {
      ...newCommentData,
      id: `c-${Date.now()}`,
      createdAt: 'Just now',
    };

    setComments((prev) => [...prev, newComment]);
    setActiveCommentId(newComment.id);
    setToastMessage({
      title: `[${newComment.tag}] Note Added`,
      description: `Pinned at ${newComment.author} (${newComment.role}) to exact timecode.`,
      type: 'success',
    });
  };

  // Toggle Resolve Status
  const handleToggleResolve = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextResolved = !c.resolved;
          return { ...c, resolved: nextResolved };
        }
        return c;
      })
    );
  };

  // Delete Comment
  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    if (activeCommentId === id) {
      setActiveCommentId(null);
    }
  };

  // Export REAPER CSV
  const handleExportReaperCSV = () => {
    const result = downloadReaperCSV(comments, 'sonicframe_episode04_reaper_markers.csv');
    setToastMessage({
      title: 'REAPER Marker CSV Exported',
      description: `Downloaded ${result.count} unresolved markers formatted with exact SMPTE timecodes into "${result.filename}".`,
      type: 'success',
    });
  };

  // Toggle Deliverable Approval
  const handleToggleApprove = () => {
    setIsApproved((prev) => {
      const next = !prev;
      setToastMessage({
        title: next ? 'Deliverable Approved' : 'Deliverable Returned to In-Review',
        description: next
          ? 'Final 5.1 surround mix locked by Showrunner and Director for broadcast delivery.'
          : 'Deliverable unlocked for further audio revisions.',
        type: next ? 'success' : 'info',
      });
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-zinc-100 font-sans overflow-hidden">
      {/* Studio Header Bar */}
      <StudioHeader
        version={version}
        onVersionChange={handleVersionChange}
        comments={comments}
        onExportReaperCSV={handleExportReaperCSV}
        isApproved={isApproved}
        onToggleApprove={handleToggleApprove}
        isPlaying={isPlaying}
      />

      {/* Main Workspace Body: Left Stage (Waveform & Session Context) + Right (Timecode Revision Queue) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Audio Player, Waveform, Session Info & Comment Bar */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-zinc-950">
          {/* Waveform Timeline Area */}
          <WaveformTimeline
            version={version}
            barsV1={barsV1}
            barsV2={barsV2}
            comments={comments}
            activeCommentId={activeCommentId}
            onSelectComment={(id) => setActiveCommentId(id)}
            playheadMs={playheadMs}
            onSeek={handleSeek}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
          />

          {/* Session Overview & Stem Rack */}
          <div className="flex-1 p-4 lg:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Broadcast Mastering Specs */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Loudness Standard
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    EBU R128 / ITU-R BS.1770
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-zinc-100">
                    {VERSION_METADATA[version].lufs}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Integrated</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Compliant with streaming delivery tolerance (±0.5 LUFS).
                </p>
              </div>

              {/* Card 2: True Peak & Headroom */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Max True Peak
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PASS
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-zinc-100">
                    {VERSION_METADATA[version].peak}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">TP Ceiling</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Intersample peak headroom preserved without clipping.
                </p>
              </div>

              {/* Card 3: Unresolved Revision Markers */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    REAPER Marker Queue
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300">
                    SYNC READY
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {comments.filter((c) => !c.resolved).length}
                  </span>
                  <span className="text-xs text-zinc-400">Open mix notes awaiting engineer import</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  One-click export inserts exact region flags into your DAW.
                </p>
              </div>
            </div>

            {/* DAW Integration Quick Spec */}
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 border border-zinc-700">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">
                    Direct DAW Workflow: REAPER CSV Marker Import
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Export markers and drag directly into REAPER via <em>View &gt; Region/Marker Manager &gt; Import</em>.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportReaperCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors whitespace-nowrap self-start sm:self-center"
              >
                Export CSV Markers
              </button>
            </div>
          </div>

          {/* Bottom Timestamped Comment Bar */}
          <CommentInputBar
            playheadMs={playheadMs}
            currentVersion={version}
            onAddComment={handleAddComment}
          />
        </div>

        {/* Right Side: Timecode Revision Queue Sidebar */}
        <RevisionQueue
          comments={comments}
          activeCommentId={activeCommentId}
          onSelectComment={(id, timeMs) => {
            setActiveCommentId(id);
            setPlayheadMs(timeMs);
          }}
          onToggleResolve={handleToggleResolve}
          onDeleteComment={handleDeleteComment}
          playheadMs={playheadMs}
        />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 max-w-md p-3.5 rounded-xl bg-zinc-900/95 border border-amber-500/30 shadow-2xl text-zinc-100 flex items-start gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-zinc-100">{toastMessage.title}</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
              {toastMessage.description}
            </p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
