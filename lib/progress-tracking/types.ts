export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface ContentProgress {
  id: string;
  userId: string;
  status: ProgressStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChunkProgress extends ContentProgress {
  contentChunkId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleProgress extends ContentProgress {
  moduleId: string;
  title?: string;
  completedChunks: number;
  totalChunks: number;
}

export interface SequenceProgress extends ContentProgress {
  sequenceId: string;
  title?: string;
  completedModules: number;
  totalModules: number;
}

export interface LearningPathProgress extends ContentProgress {
  learningPathId: string;
  title?: string;
  completedSequences: number;
  totalSequences: number;
}

export interface ProgressUpdateOptions {
  updateParents?: boolean;
  deferChunkUpdates?: boolean;
}

export interface DeferredChunkUpdate {
  userId: string;
  contentChunkId: string;
  status: ProgressStatus;
  timestamp: Date;
}

// Queue for tracking deferred chunk updates
export interface DeferredUpdateQueue {
  updates: DeferredChunkUpdate[];
  add(update: DeferredChunkUpdate): void;
  flush(): Promise<void>;
}

export interface LastAccessedContent {
  chunk: ChunkProgress | null;
  module: ModuleProgress | null;
  sequence: SequenceProgress | null;
  learningPath: LearningPathProgress | null;
} 