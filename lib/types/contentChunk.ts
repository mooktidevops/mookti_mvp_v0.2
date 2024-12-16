// lib/types/contentChunk.ts

export enum ContentChunkType {
  lesson = 'lesson',
  metalesson = 'metalesson',
  introduction = 'introduction',
  conclusion = 'conclusion',
  example = 'example',
  application = 'application',
  image = 'image',
  video = 'video',
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
  moduleId: string;
  sequence_order: number;
  title?: string;
  description?: string;
  type: ContentChunkType;
  nextAction: ContentChunkNextAction;
  content: string;
  mediaAssetId?: string;
}