import { StudioComment } from '@/types/studio';
import { INITIAL_COMMENTS } from './mockData';

// Global singleton in-memory storage for serverless edge and Node runtimes
const globalForStore = globalThis as unknown as {
  sonicFrameComments: StudioComment[] | undefined;
};

if (!globalForStore.sonicFrameComments) {
  globalForStore.sonicFrameComments = [...INITIAL_COMMENTS];
}

export const commentsStore = {
  getAll: (): StudioComment[] => {
    return globalForStore.sonicFrameComments ?? [...INITIAL_COMMENTS];
  },

  add: (comment: Omit<StudioComment, 'id' | 'createdAt'>): StudioComment => {
    const newRecord: StudioComment = {
      ...comment,
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: 'Just now',
    };
    if (!globalForStore.sonicFrameComments) {
      globalForStore.sonicFrameComments = [...INITIAL_COMMENTS];
    }
    globalForStore.sonicFrameComments.unshift(newRecord);
    return newRecord;
  },

  update: (id: string, updates: Partial<Pick<StudioComment, 'resolved' | 'text' | 'tag'>>): StudioComment | null => {
    if (!globalForStore.sonicFrameComments) {
      globalForStore.sonicFrameComments = [...INITIAL_COMMENTS];
    }
    const idx = globalForStore.sonicFrameComments.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const existing = globalForStore.sonicFrameComments[idx];
    const updated: StudioComment = {
      ...existing,
      ...updates,
    };
    globalForStore.sonicFrameComments[idx] = updated;
    return updated;
  },

  delete: (id: string): boolean => {
    if (!globalForStore.sonicFrameComments) return false;
    const initialLen = globalForStore.sonicFrameComments.length;
    globalForStore.sonicFrameComments = globalForStore.sonicFrameComments.filter((c) => c.id !== id);
    return globalForStore.sonicFrameComments.length < initialLen;
  },
};
