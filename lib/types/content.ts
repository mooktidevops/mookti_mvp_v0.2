// Define valid enum values from the database schema
export const ChunkType = ['lesson', 'metalesson', 'introduction', 'conclusion', 'example', 'application', 'image', 'video'] as const;
export const NextAction = ['getNext', 'checkIn', 'assessment', 'studio', 'nextModule'] as const;
export const DisplayType = ['message', 'card', 'card_carousel'] as const;

export type ChunkType = typeof ChunkType[number];
export type NextAction = typeof NextAction[number];
export type DisplayType = typeof DisplayType[number];

// Type for API responses
export type ApiResponse<T> = T | { error: string; details?: unknown[] }; 