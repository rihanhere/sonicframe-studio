'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileAudio,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';

interface UploadMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMasterModal: React.FC<UploadMasterModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<{ name: string; size: string; type: string } | null>({
    name: 'Episode_04_Final_Mix_5.1_48k24b.wav',
    size: '482.4 MB',
    type: 'audio/wav',
  });
  const [version, setVersion] = useState<'v1' | 'v2'>('v2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [presignResult, setPresignResult] = useState<{
    uploadUrl: string;
    storageKey: string;
    bucket: string;
    endpoint: string;
    expiresInSeconds: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleGeneratePresignedUrl = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file?.name || 'master_mix.wav',
          contentType: 'audio/wav',
          version,
          assetId: 'ep04-final-surround',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPresignResult(data);
      }
    } catch (err) {
      console.error('Presign generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-zinc-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Direct S3 / Wasabi WAV Upload</h3>
            <p className="text-xs text-zinc-400">
              Zero-server bottleneck. Client streams directly to S3 via native HMAC-SHA256 presigned URLs.
            </p>
          </div>
        </div>

        {/* File Dropzone Mockup */}
        <div className="p-4 rounded-xl border border-dashed border-zinc-700/80 bg-zinc-900/40 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400">
            <FileAudio className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate">{file?.name}</p>
            <p className="text-[11px] text-zinc-500 font-mono">
              {file?.size} • Broadcast WAV • 48kHz / 24-Bit Linear PCM
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            READY
          </span>
        </div>

        {/* Version Switcher */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">
            Target Version Slot
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setVersion('v1')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                version === 'v1'
                  ? 'bg-zinc-900 border-amber-500/50 text-white font-semibold ring-1 ring-amber-500/20'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>v1 Rough Cut</span>
                <span className="text-[10px] font-mono text-zinc-500">-18.4 LUFS</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setVersion('v2')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                version === 'v2'
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 font-semibold ring-1 ring-amber-500/20'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>v2 Loudness Matched</span>
                <span className="text-[10px] font-mono text-amber-400">-14.1 LUFS</span>
              </div>
            </button>
          </div>
        </div>

        {/* Presigned Result Inspection */}
        {presignResult ? (
          <div className="mb-5 p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                AWS SigV4 Presigned URL Generated
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                Expires in {presignResult.expiresInSeconds}s
              </span>
            </div>
            <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-zinc-400 break-all leading-tight max-h-16 overflow-y-auto">
              {presignResult.uploadUrl}
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
              <span>Endpoint: {presignResult.endpoint}</span>
              <span>Bucket: {presignResult.bucket}</span>
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <button
              onClick={handleGeneratePresignedUrl}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700 hover:border-zinc-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>{isGenerating ? 'Computing SigV4 Hashes...' : 'Test HMAC-SHA256 Presign Generation'}</span>
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <Link
            href="/review/demo"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs shadow-md shadow-amber-500/20"
          >
            <span>Open in Studio Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
