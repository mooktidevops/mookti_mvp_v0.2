export interface ContentChunk {
  id: string;         // UUID
  moduleId: string;   // Matches Module.id
  order: number;      // Position of chunk within the module
  title?: string;
  description?: string;
  type: 'lesson' | 'metalesson' | 'introduction' | 'conclusion' | 'example' | 'application' | 'image' | 'video';
  nextAction: 'getNext' | 'checkIn' | 'assessment' | 'studio' | 'nextModule';
  content: string;
  mediaAssetId?: string;  // optional, if chunk references a media asset
}
