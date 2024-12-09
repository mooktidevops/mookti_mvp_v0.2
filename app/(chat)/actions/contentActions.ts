'use server'

import { getNextContentChunk as getNextContentChunkLogic } from '@/lib/content/getNextContentChunk';
import { handleUserCheckIn as handleUserCheckInLogic } from '@/lib/content/handleUserCheckIn';
import { ContentChunk } from '@/lib/types/contentChunk';

export async function handleUserCheckIn(currentChunk: ContentChunk, userResponse: 'moveon' | 'tellmemore') {
  return handleUserCheckInLogic(currentChunk, userResponse);
}

export async function getNextContentChunk(currentChunk: ContentChunk) {
  return getNextContentChunkLogic(currentChunk);
}