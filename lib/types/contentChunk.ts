// lib/types/contentChunk.ts
import { DisplayType } from './displayType';

export type ContentChunkType = 'lesson' | 'metalesson' | 'introduction'| 'conclusion' | 'example' | 'application' | 'media' | 'assessment';

export enum ContentChunkNextAction {
  getNext = 'getNext',
  checkIn = 'checkIn',
  assessment = 'assessment',
  studio = 'studio',
  nextModule = 'nextModule'
}

export interface ContentChunk {
  id: string;
  module_id: string;
  sequence_order: number;
  title?: string;
  description?: string;
  type: ContentChunkType;
  nextAction: ContentChunkNextAction;
  content: string;
  mediaAssetId?: string;
  display_type: DisplayType;
}