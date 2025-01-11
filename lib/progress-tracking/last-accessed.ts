import { eq, and, desc, count } from 'drizzle-orm/sql';

import { db } from '@/db';
import {
  userContentChunkProgress,
  userModuleProgress,
  userSequenceProgress,
  userLearningPathProgress,
  contentChunks,
  modules,
  sequences,
  learningPaths,
  sequenceModules,
  learningPathSequences
} from '@/db/schema';

import {
  ChunkProgress,
  ModuleProgress,
  SequenceProgress,
  LearningPathProgress
} from './types';

export interface LastAccessedContent {
  chunk: ChunkProgress | null;
  module: ModuleProgress | null;
  sequence: SequenceProgress | null;
  learningPath: LearningPathProgress | null;
}

export class LastAccessedContentError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'LastAccessedContentError';
  }
}

export async function getLastAccessedContent(userId: string): Promise<LastAccessedContent> {
  if (!userId) {
    throw new LastAccessedContentError('User ID is required');
  }

  try {
    // Get last accessed chunk
    const lastChunk = await db
      .select()
      .from(userContentChunkProgress)
      .where(eq(userContentChunkProgress.userId, userId))
      .orderBy(desc(userContentChunkProgress.lastAccessedAt))
      .limit(1);

    if (!lastChunk.length) {
      return { chunk: null, module: null, sequence: null, learningPath: null };
    }

    // Get associated module
    const chunk = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.id, lastChunk[0].contentChunkId))
      .limit(1);

    if (!chunk.length) {
      return {
        chunk: lastChunk[0] as ChunkProgress,
        module: null,
        sequence: null,
        learningPath: null
      };
    }

    // Get module progress with counts
    const moduleId = chunk[0].module_id;

    // Get completed chunks count
    const [completedChunksResult] = await db
      .select({ value: count() })
      .from(userContentChunkProgress)
      .where(
        and(
          eq(userContentChunkProgress.userId, userId),
          eq(contentChunks.module_id, moduleId),
          eq(userContentChunkProgress.status, 'completed')
        )
      );

    // Get total chunks count
    const [totalChunksResult] = await db
      .select({ value: count() })
      .from(contentChunks)
      .where(eq(contentChunks.module_id, moduleId));

    // Get module progress
    const [moduleProgressResult] = await db
      .select()
      .from(userModuleProgress)
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          eq(userModuleProgress.moduleId, moduleId)
        )
      )
      .limit(1);

    if (!moduleProgressResult) {
      throw new LastAccessedContentError(`Module progress not found for module ${moduleId}`);
    }

    const moduleProgress: ModuleProgress = {
      ...moduleProgressResult,
      completedChunks: Number(completedChunksResult?.value || 0),
      totalChunks: Number(totalChunksResult?.value || 0)
    };

    // Get sequence progress
    const sequenceModuleRows = await db
      .select()
      .from(sequenceModules)
      .where(eq(sequenceModules.moduleId, moduleId));

    if (!sequenceModuleRows.length) {
      return {
        chunk: lastChunk[0] as ChunkProgress,
        module: moduleProgress,
        sequence: null,
        learningPath: null
      };
    }

    const sequenceId = sequenceModuleRows[0].sequenceId;

    // Get completed modules count
    const [completedModulesResult] = await db
      .select({ value: count() })
      .from(userModuleProgress)
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          eq(userModuleProgress.status, 'completed')
        )
      );

    // Get total modules count
    const [totalModulesResult] = await db
      .select({ value: count() })
      .from(sequenceModules)
      .where(eq(sequenceModules.sequenceId, sequenceId));

    // Get sequence progress
    const [sequenceProgressResult] = await db
      .select()
      .from(userSequenceProgress)
      .where(
        and(
          eq(userSequenceProgress.userId, userId),
          eq(userSequenceProgress.sequenceId, sequenceId)
        )
      );

    if (!sequenceProgressResult) {
      throw new LastAccessedContentError(`Sequence progress not found for sequence ${sequenceId}`);
    }

    const sequenceProgress: SequenceProgress = {
      ...sequenceProgressResult,
      completedModules: Number(completedModulesResult?.value || 0),
      totalModules: Number(totalModulesResult?.value || 0)
    };

    // Get learning path progress
    const learningPathSequenceRows = await db
      .select()
      .from(learningPathSequences)
      .where(eq(learningPathSequences.sequenceId, sequenceId));

    if (!learningPathSequenceRows.length) {
      return {
        chunk: lastChunk[0] as ChunkProgress,
        module: moduleProgress,
        sequence: sequenceProgress,
        learningPath: null
      };
    }

    const learningPathId = learningPathSequenceRows[0].learningPathId;

    // Get completed sequences count
    const [completedSequencesResult] = await db
      .select({ value: count() })
      .from(userSequenceProgress)
      .where(
        and(
          eq(userSequenceProgress.userId, userId),
          eq(userSequenceProgress.status, 'completed')
        )
      );

    // Get total sequences count
    const [totalSequencesResult] = await db
      .select({ value: count() })
      .from(learningPathSequences)
      .where(eq(learningPathSequences.learningPathId, learningPathId));

    // Get learning path progress
    const [learningPathProgressResult] = await db
      .select()
      .from(userLearningPathProgress)
      .where(
        and(
          eq(userLearningPathProgress.userId, userId),
          eq(userLearningPathProgress.learningPathId, learningPathId)
        )
      );

    if (!learningPathProgressResult) {
      throw new LastAccessedContentError(`Learning path progress not found for path ${learningPathId}`);
    }

    const learningPathProgress: LearningPathProgress = {
      ...learningPathProgressResult,
      completedSequences: Number(completedSequencesResult?.value || 0),
      totalSequences: Number(totalSequencesResult?.value || 0)
    };

    return {
      chunk: lastChunk[0] as ChunkProgress,
      module: moduleProgress,
      sequence: sequenceProgress,
      learningPath: learningPathProgress
    };
  } catch (error) {
    if (error instanceof LastAccessedContentError) {
      throw error;
    }
    throw new LastAccessedContentError('Failed to get last accessed content', error);
  }
} 