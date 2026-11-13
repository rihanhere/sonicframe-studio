'use client';

import React, { useState } from 'react';
import { Send, Tag, Clock, CornerDownLeft, UserCircle2 } from 'lucide-react';
import { CommentTag, StudioComment, AudioVersion } from '@/types/studio';
import { formatSMPTETimecode } from '@/lib/waveformGenerator';

interface CommentInputBarProps {
  playheadMs: number;
  currentVersion: AudioVersion;
  onAddComment: (comment: Omit<StudioComment, 'id' | 'createdAt'>) => void;
}

const TAG_CONFIG: { tag: CommentTag; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    tag: 'MIX',
    label: 'MIX',
    activeClass: 'bg-amber-500 text-black border-amber-400 font-bold shadow-amber-500/20 shadow-sm',
    inactiveClass: 'text-amber-400/80 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
  },
  {
    tag: 'FOLEY',
    label: 'FOLEY',
    activeClass: 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-emerald-500/20 shadow-sm',
    inactiveClass: 'text-emerald-400/80 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  {
    tag: 'BGM',
    label: 'BGM',
    activeClass: 'bg-purple-500 text-black border-purple-400 font-bold shadow-purple-500/20 shadow-sm',
    inactiveClass: 'text-purple-400/80 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
  },
  {
    tag: 'DIALOGUE',
    label: 'DIALOGUE',
    activeClass: 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-cyan-500/20 shadow-sm',
    inactiveClass: 'text-cyan-400/80 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20',
  },
];

export const CommentInputBar: React.FC<CommentInputBarProps> = ({
  playheadMs,
  currentVersion,
  onAddComment,
}) => {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState<CommentTag>('MIX');
  const [authorRole, setAuthorRole] = useState<'Director' | 'Mix Engineer' | 'Sound Supervisor'>('Director');
  const [authorName, setAuthorName] = useState('Sarah Chen');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddComment({
      timeMs: playheadMs,
      author: authorName,
      role: authorRole,
      text: text.trim(),
      tag: selectedTag,
      resolved: false,
      version: currentVersion,
    });

    setText('');
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-3 px-4 sticky bottom-0 z-30">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Timestamp Pill & Category Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timestamp Pill locked to playhead */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-semibold text-amber-400 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formatSMPTETimecode(playheadMs)}</span>
          </div>

          {/* Category Tag Selector */}
          <div className="flex items-center gap-1">
            {TAG_CONFIG.map(({ tag, label, activeClass, inactiveClass }) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all border ${
                  selectedTag === tag ? activeClass : inactiveClass
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Drop a ${selectedTag} note at ${formatSMPTETimecode(playheadMs)}...`}
            className="w-full bg-zinc-900/90 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-700/80 focus:border-amber-400/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors pr-20 shadow-inner font-sans"
          />

          {/* Post Button */}
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-md bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-semibold text-xs flex items-center gap-1 transition-all shadow-sm"
          >
            <span>Post</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* User Identity switcher */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400 pl-1 border-l border-zinc-800">
          <UserCircle2 className="w-4 h-4 text-zinc-500" />
          <select
            value={`${authorName}|${authorRole}`}
            onChange={(e) => {
              const [name, role] = e.target.value.split('|');
              setAuthorName(name);
              setAuthorRole(role as 'Director' | 'Mix Engineer' | 'Sound Supervisor');
            }}
            className="bg-transparent border-none text-zinc-300 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="Sarah Chen|Director" className="bg-zinc-900 text-zinc-200">
              Sarah Chen (Director)
            </option>
            <option value="Marcus Vance|Sound Supervisor" className="bg-zinc-900 text-zinc-200">
              Marcus Vance (Supervisor)
            </option>
            <option value="Elena Rostova|Mix Engineer" className="bg-zinc-900 text-zinc-200">
              Elena Rostova (Mixer)
            </option>
          </select>
        </div>
      </form>
    </div>
  );
};
