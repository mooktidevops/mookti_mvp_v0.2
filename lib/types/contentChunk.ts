// lib/types/contentChunk.ts
import { DisplayType } from './displayType';

export enum ContentChunkType {
  lesson = 'lesson',
  metalesson = 'metalesson',
  introduction = 'introduction',
  conclusion = 'conclusion',
  example = 'example',
  application = 'application',
  media = 'media',
  assessment = 'assessment'
}

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