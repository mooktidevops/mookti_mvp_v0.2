export interface ContentChunk {
    id: string;  // Assuming we'll use UUID for ids
    moduleId: number; // Indicates module to which chunk belongs
    chunkId: number; // Indicates place of chunk within module
    title?: string;  // Optional
    description?: string;  // Optional
    type: 'lesson' | 'metalesson' | 'introduction' | 'conclusion' | 'example' | 'application';  // Extend this union type as needed
    nextAction: 'getNext' | 'checkIn' | 'assessment' | 'studio' | 'nextModule';  // Extend this union type as needed
    content: string; // primary chunk content
  }