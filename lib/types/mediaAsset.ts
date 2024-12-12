export interface MediaAsset {
    id: string;      // UUID
    url: string;
    type: 'image' | 'video';
    altText?: string;
    createdAt: Date;
    updatedAt: Date;
  }