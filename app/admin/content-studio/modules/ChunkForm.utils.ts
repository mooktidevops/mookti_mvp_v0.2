// app/admin/content-studio/modules/ChunkForm.utils.ts
import { ContentChunkNextAction, ContentChunkType } from '@/lib/types/contentChunk';

export function getChunkTypeOptions(): { value: ContentChunkType; label: string }[] {
  return Object.values(ContentChunkType).map(value => ({
    value,
    // Convert first character to uppercase for display
    label: value.charAt(0).toUpperCase() + value.slice(1)
  }));
}

export function getNextActionOptions(): { value: ContentChunkNextAction; label: string }[] {
  return Object.values(ContentChunkNextAction).map(value => ({
    value,
    // Convert camelCase to Title Case while preserving original value
    label: value
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim()
  }));
}