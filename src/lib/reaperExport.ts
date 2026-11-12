import { StudioComment, CommentTag } from '@/types/studio';
import { formatReaperTimecode } from './waveformGenerator';

// REAPER marker color mapping per category tag
const TAG_COLOR_MAP: Record<CommentTag, string> = {
  MIX: '#F59E0B',      // Amber
  FOLEY: '#10B981',    // Emerald
  BGM: '#8B5CF6',      // Violet
  DIALOGUE: '#06B6D4', // Cyan
};

/**
 * Generates REAPER Marker CSV text according to Cockos REAPER standard:
 * Header: #, Name, Start, End, Length, Color
 */
export function generateReaperMarkerCSV(comments: StudioComment[]): string {
  // Filter for unresolved comments as requested
  const unresolved = comments.filter((c) => !c.resolved);

  // REAPER standard header
  const header = '#, Name, Start, End, Length, Color';

  const rows = unresolved.map((c, index) => {
    const markerIndex = `M${index + 1}`;
    const cleanText = c.text.replace(/"/g, '""');
    const markerName = `"[${c.tag}] ${c.author} (${c.role}): ${cleanText}"`;
    const startTc = formatReaperTimecode(c.timeMs);
    const endTc = startTc;
    const lengthTc = '00:00:00.000';
    const colorHex = TAG_COLOR_MAP[c.tag] || '#3B82F6';

    return `${markerIndex}, ${markerName}, ${startTc}, ${endTc}, ${lengthTc}, ${colorHex}`;
  });

  return [header, ...rows].join('\r\n');
}

/**
 * Triggers client-side browser download of the REAPER Marker CSV file
 */
export function downloadReaperCSV(
  comments: StudioComment[],
  filename: string = 'sonicframe_episode04_reaper_markers.csv'
): { count: number; filename: string } {
  const unresolved = comments.filter((c) => !c.resolved);
  const csvContent = generateReaperMarkerCSV(comments);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { count: unresolved.length, filename };
}
