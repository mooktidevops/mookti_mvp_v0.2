import { ContentChunk } from '@/lib/types/contentChunk';

export async function handleUserCheckIn(currentChunk: ContentChunk, userResponse: 'moveon' | 'tellmemore'): Promise<'getNext' | 'repeat'> {
  if (userResponse === 'moveon') {
    return 'getNext';
  } else if (userResponse === 'tellmemore') {
    // Here you could implement logic to provide more detailed information
    // For now, we'll just repeat the current chunk
    return 'repeat';
  } else {
    console.warn(`Unexpected user response: ${userResponse}`);
    return 'repeat';
  }
}