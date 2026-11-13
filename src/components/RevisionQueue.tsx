'use client';

import React, { useState } from 'react';
import {
  StudioComment,
  CommentTag,
} from '@/types/studio';
import { formatSMPTETimecode } from '@/lib/waveformGenerator';
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Trash2,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface RevisionQueueProps {
  comments: StudioComment[];
  activeCommentId: string | null;
  onSelectComment: (id: string, timeMs: number) => void;
  onToggleResolve: (id: string) => void;
  onDeleteComment: (id: string) => void;
  playheadMs: number;
}

const TAG_COLORS: Record<CommentTag, { bg: string; text: string; border: string }> = {
  MIX: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  FOLEY: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  BGM: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  DIALOGUE: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
};

export const RevisionQueue: React.FC<RevisionQueueProps> = ({
  comments,
  activeCommentId,
  onSelectComment,
  onToggleResolve,
  onDeleteComment,
  playheadMs,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState<CommentTag | 'ALL'>('ALL');

  // Filter comments
  const filteredComments = comments.filter((c) => {
    if (filterStatus === 'OPEN' && c.resolved) return false;
    if (filterStatus === 'RESOLVED' && !c.resolved) return false;
    if (selectedTagFilter !== 'ALL' && c.tag !== selectedTagFilter) return false;
    return true;
  });

  const openCount = comments.filter((c) => !c.resolved).length;
  const resolvedCount = comments.filter((c) => c.resolved).length;

  return (
    <aside className="w-full lg:w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-zinc-800 bg-zinc-900/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Timecode Revision Queue
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
            {comments.length} Notes
          </span>
        </div>

        {/* Filter Tabs: ALL, OPEN, RESOLVED */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({comments.length})
          </button>
          <button
            onClick={() => setFilterStatus('OPEN')}
            className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
              filterStatus === 'OPEN'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilterStatus('RESOLVED')}
            className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
              filterStatus === 'RESOLVED'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Tag Pill Sub-filters */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setSelectedTagFilter('ALL')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              selectedTagFilter === 'ALL'
                ? 'bg-zinc-700 text-zinc-100 font-semibold'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ALL
          </button>
          {(['MIX', 'FOLEY', 'BGM', 'DIALOGUE'] as CommentTag[]).map((tag) => {
            const isSelected = selectedTagFilter === tag;
            const style = TAG_COLORS[tag];
            return (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(isSelected ? 'ALL' : tag)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border ${
                  isSelected
                    ? `${style.bg} ${style.text} ${style.border} font-bold ring-1 ring-current`
                    : 'bg-zinc-900/80 border-zinc-800/80 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900 p-2 space-y-1.5">
        {filteredComments.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No notes match this filter</p>
            <p className="text-[11px] text-zinc-600 mt-1">
              Drop a new timestamped note or switch status filters.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isSelected = activeCommentId === comment.id;
            const style = TAG_COLORS[comment.tag] || TAG_COLORS.MIX;
            const isNearPlayhead = Math.abs(comment.timeMs - playheadMs) < 1500;

            return (
              <div
                key={comment.id}
                onClick={() => onSelectComment(comment.id, comment.timeMs)}
                className={`group p-3 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-zinc-900/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                    : isNearPlayhead
                    ? 'bg-zinc-900/50 border-zinc-700/80'
                    : 'bg-zinc-950/40 hover:bg-zinc-900/60 border-zinc-850/60 hover:border-zinc-750'
                } ${comment.resolved ? 'opacity-70' : 'opacity-100'}`}
              >
                {/* Header: Author + Role + Timecode pill + Tag Badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-zinc-200">
                      {comment.author}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 font-mono">
                      {comment.role}
                    </span>
                  </div>

                  {/* Timecode Jump Button */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 hover:bg-amber-400/20 transition-colors">
                    <Clock className="w-3 h-3 text-amber-400/80" />
                    <span>{formatSMPTETimecode(comment.timeMs)}</span>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-zinc-300 leading-relaxed mb-2 font-normal">
                  {comment.text}
                </p>

                {/* Footer: Tag Pill + Version + Resolved Toggle + Delete */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-900">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {comment.tag}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {comment.version.toUpperCase()} • {comment.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Resolved Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleResolve(comment.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        comment.resolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                      }`}
                      title={comment.resolved ? 'Mark as Open' : 'Mark as Resolved'}
                    >
                      {comment.resolved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Resolved</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3 h-3" />
                          <span>Resolve</span>
                        </>
                      )}
                    </button>

                    {/* Delete note button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteComment(comment.id);
                      }}
                      className="p-1 text-zinc-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete revision note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
