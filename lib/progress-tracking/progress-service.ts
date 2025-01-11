import { and, eq, sql } from 'drizzle-orm/sql';
import { z } from 'zod';

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
  InvalidStatusTransitionError,
  InvalidTimestampError,
  ContentNotFoundError,
  ValidationError,
  DatabaseError,
  QueueError,
  ProgressTrackingError
} from './errors';
import {
  ProgressStatus,
  ChunkProgress,
  ModuleProgress,
  SequenceProgress,
  LearningPathProgress,
  ProgressUpdateOptions,
  DeferredChunkUpdate,
  DeferredUpdateQueue
} from './types';
import {
  validateStatusTransition,
  validateTimestamps,
  validateProgressRecord,
  chunkProgressSchema,
  moduleProgressSchema,
  sequenceProgressSchema,
  learningPathProgressSchema,
  progressUpdateOptionsSchema
} from './validation';

// Validation schemas for input parameters
const userIdSchema = z.string().uuid();
const contentIdSchema = z.string().uuid();
const contentTypeSchema = z.enum(['chunk', 'module', 'sequence', 'path']);

class ProgressUpdateQueueImpl implements DeferredUpdateQueue {
  updates: DeferredChunkUpdate[] = [];

  add(update: DeferredChunkUpdate): void {
    if (!update.userId || !update.contentChunkId || !update.status || !update.timestamp) {
      throw new ValidationError('Invalid deferred update: missing required fields');
    }
    this.updates.push(update);
  }

  async flush(): Promise<void> {
    if (this.updates.length === 0) return;

    try {
      // Group updates by user and chunk for efficiency
      const groupedUpdates = this.updates.reduce((acc, update) => {
        const key = `${update.userId}-${update.contentChunkId}`;
        if (!acc[key] || acc[key].timestamp < update.timestamp) {
          acc[key] = update;
        }
        return acc;
      }, {} as Record<string, DeferredChunkUpdate>);

      // Batch update all chunks
      await Promise.all(
        Object.values(groupedUpdates).map(async update => {
          try {
            // Validate the update before applying
            const currentProgress = await db
              .select()
              .from(userContentChunkProgress)
              .where(
                and(
                  eq(userContentChunkProgress.userId, update.userId),
                  eq(userContentChunkProgress.contentChunkId, update.contentChunkId)
                )
              )
              .limit(1);

            if (currentProgress.length > 0) {
              const current = currentProgress[0];
              if (!validateStatusTransition(current.status as ProgressStatus, update.status)) {
                throw new InvalidStatusTransitionError(current.status, update.status);
              }
            }

            await db
              .update(userContentChunkProgress)
              .set({
                status: update.status,
                completedAt: update.status === 'completed' ? update.timestamp : null,
                lastAccessedAt: update.timestamp,
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(userContentChunkProgress.userId, update.userId),
                  eq(userContentChunkProgress.contentChunkId, update.contentChunkId)
                )
              );
          } catch (error) {
            // Log error but continue with other updates
            console.error('Error processing deferred update:', error);
            throw new QueueError('update', error);
          }
        })
      );
    } catch (error) {
      throw new QueueError('flush', error);
    } finally {
      this.updates = [];
    }
  }
}

export const progressQueue = new ProgressUpdateQueueImpl();

export class ProgressTrackingService {
  private async validateInput(userId: string, contentType: string, contentId: string): Promise<void> {
    try {
      userIdSchema.parse(userId);
      contentTypeSchema.parse(contentType);
      contentIdSchema.parse(contentId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(`Invalid input parameters: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  private async ensureProgressRecord(
    userId: string,
    contentType: 'chunk' | 'module' | 'sequence' | 'path',
    contentId: string
  ): Promise<void> {
    try {
      await this.validateInput(userId, contentType, contentId);
      const timestamp = new Date();

      switch (contentType) {
        case 'chunk': {
          // First verify the content exists
          try {
            const contentExists = await db
              .select()
              .from(contentChunks)
              .where(eq(contentChunks.id, contentId))
              .limit(1);

            if (contentExists.length === 0) {
              throw new ContentNotFoundError('Content chunk', contentId);
            }

            const existing = await db
              .select()
              .from(userContentChunkProgress)
              .where(
                and(
                  eq(userContentChunkProgress.userId, userId),
                  eq(userContentChunkProgress.contentChunkId, contentId)
                )
              )
              .limit(1);

            if (existing.length === 0) {
              const newRecord = {
                userId,
                contentChunkId: contentId,
                status: 'not_started' as const,
                startedAt: null,
                completedAt: null,
                lastAccessedAt: timestamp
              };

              try {
                validateProgressRecord(chunkProgressSchema, {
                  ...newRecord,
                  id: 'temp' // Will be replaced by DB
                });
              } catch (error) {
                throw new ValidationError(error instanceof Error ? error.message : String(error));
              }

              await db.insert(userContentChunkProgress).values(newRecord);
            }
          } catch (error) {
            if (error instanceof ProgressTrackingError) {
              throw error;
            }
            throw new DatabaseError('select or insert', error);
          }
          break;
        }
        case 'module': {
          // First verify the module exists
          const moduleExists = await db
            .select()
            .from(modules)
            .where(eq(modules.id, contentId))
            .limit(1);

          if (moduleExists.length === 0) {
            throw new ContentNotFoundError('Module', contentId);
          }

          const existing = await db
            .select()
            .from(userModuleProgress)
            .where(
              and(
                eq(userModuleProgress.userId, userId),
                eq(userModuleProgress.moduleId, contentId)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            await db.insert(userModuleProgress).values({
              userId,
              moduleId: contentId,
              status: 'not_started'
            });
          }
          break;
        }
        case 'sequence': {
          // First verify the sequence exists
          const sequenceExists = await db
            .select()
            .from(sequences)
            .where(eq(sequences.id, contentId))
            .limit(1);

          if (sequenceExists.length === 0) {
            throw new ContentNotFoundError('Sequence', contentId);
          }

          const existing = await db
            .select()
            .from(userSequenceProgress)
            .where(
              and(
                eq(userSequenceProgress.userId, userId),
                eq(userSequenceProgress.sequenceId, contentId)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            await db.insert(userSequenceProgress).values({
              userId,
              sequenceId: contentId,
              status: 'not_started'
            });
          }
          break;
        }
        case 'path': {
          // First verify the learning path exists
          const pathExists = await db
            .select()
            .from(learningPaths)
            .where(eq(learningPaths.id, contentId))
            .limit(1);

          if (pathExists.length === 0) {
            throw new ContentNotFoundError('Learning path', contentId);
          }

          const existing = await db
            .select()
            .from(userLearningPathProgress)
            .where(
              and(
                eq(userLearningPathProgress.userId, userId),
                eq(userLearningPathProgress.learningPathId, contentId)
              )
            )
            .limit(1);

          if (existing.length === 0) {
            await db.insert(userLearningPathProgress).values({
              userId,
              learningPathId: contentId,
              status: 'not_started'
            });
          }
          break;
        }
      }
    } catch (error) {
      if (error instanceof ProgressTrackingError) {
        throw error;
      }
      throw new DatabaseError('ensureProgressRecord', error);
    }
  }

  async updateChunkProgress(
    userId: string,
    contentChunkId: string,
    newStatus: ProgressStatus,
    options: ProgressUpdateOptions = {}
  ): Promise<ChunkProgress> {
    try {
      // Ensure the progress record exists
      await this.ensureProgressRecord(userId, 'chunk', contentChunkId);

      // Get current progress
      const currentProgress = await db
        .select()
        .from(userContentChunkProgress)
        .where(
          and(
            eq(userContentChunkProgress.userId, userId),
            eq(userContentChunkProgress.contentChunkId, contentChunkId)
          )
        )
        .limit(1);

      if (currentProgress.length === 0) {
        throw new DatabaseError('select', new Error('Progress record not found after ensuring it exists'));
      }

      const current = currentProgress[0];
      const timestamp = new Date();

      // Validate status transition
      if (!validateStatusTransition(current.status as ProgressStatus, newStatus)) {
        throw new InvalidStatusTransitionError(current.status, newStatus);
      }

      // Prepare update data
      const updateData = {
        status: newStatus,
        lastAccessedAt: timestamp,
        updatedAt: timestamp
      } as any;

      if (newStatus === 'in_progress' && current.status === 'not_started') {
        updateData.startedAt = timestamp;
      } else if (newStatus === 'completed') {
        updateData.completedAt = timestamp;
      }

      try {
        // Update progress
        await db
          .update(userContentChunkProgress)
          .set(updateData)
          .where(
            and(
              eq(userContentChunkProgress.userId, userId),
              eq(userContentChunkProgress.contentChunkId, contentChunkId)
            )
          );

        // Get updated record
        const updatedProgress = await db
          .select()
          .from(userContentChunkProgress)
          .where(
            and(
              eq(userContentChunkProgress.userId, userId),
              eq(userContentChunkProgress.contentChunkId, contentChunkId)
            )
          )
          .limit(1);

        if (updatedProgress.length === 0) {
          throw new DatabaseError('select', new Error('Updated progress record not found'));
        }

        return updatedProgress[0] as ChunkProgress;
      } catch (error) {
        if (error instanceof ProgressTrackingError) {
          throw error;
        }
        throw new DatabaseError('update', error);
      }
    } catch (error) {
      if (error instanceof ProgressTrackingError) {
        throw error;
      }
      throw new DatabaseError('updateChunkProgress', error);
    }
  }

  private async checkAndUpdateModuleProgress(
    userId: string,
    chunkId: string
  ): Promise<void> {
    const chunk = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.id, chunkId))
      .limit(1);

    if (!chunk.length) return;

    const moduleId = chunk[0].module_id;
    await this.ensureProgressRecord(userId, 'module', moduleId);

    // Count completed chunks in module
    const [result] = await db
      .select({
        completed_count: sql<number>`count(*) filter (where ${userContentChunkProgress.status} = 'completed')`,
        total_count: sql<number>`count(*)`
      })
      .from(contentChunks)
      .leftJoin(
        userContentChunkProgress,
        and(
          eq(userContentChunkProgress.contentChunkId, contentChunks.id),
          eq(userContentChunkProgress.userId, userId)
        )
      )
      .where(eq(contentChunks.module_id, moduleId));

    const completed_count = Number(result.completed_count) || 0;
    const total_count = Number(result.total_count) || 0;

    const moduleStatus: ProgressStatus =
      completed_count === 0
        ? 'not_started'
        : completed_count === total_count
        ? 'completed'
        : 'in_progress';

    await db
      .update(userModuleProgress)
      .set({
        status: moduleStatus,
        completedAt: moduleStatus === 'completed' ? new Date() : null,
        lastAccessedAt: new Date()
      })
      .where(
        and(
          eq(userModuleProgress.userId, userId),
          eq(userModuleProgress.moduleId, moduleId)
        )
      );

    // If module is completed, check sequence progress
    if (moduleStatus === 'completed') {
      await this.checkAndUpdateSequenceProgress(userId, moduleId);
    }
  }

  private async checkAndUpdateSequenceProgress(
    userId: string,
    moduleId: string
  ): Promise<void> {
    const sequences = await db
      .select()
      .from(sequenceModules)
      .where(eq(sequenceModules.moduleId, moduleId));

    for (const seq of sequences) {
      await this.ensureProgressRecord(userId, 'sequence', seq.sequenceId);

      const [result] = await db
        .select({
          completed_count: sql<number>`count(*) filter (where ${userModuleProgress.status} = 'completed')`,
          total_count: sql<number>`count(*)`
        })
        .from(sequenceModules)
        .leftJoin(
          userModuleProgress,
          and(
            eq(userModuleProgress.moduleId, sequenceModules.moduleId),
            eq(userModuleProgress.userId, userId)
          )
        )
        .where(eq(sequenceModules.sequenceId, seq.sequenceId));

      const completed_count = Number(result.completed_count) || 0;
      const total_count = Number(result.total_count) || 0;

      const sequenceStatus: ProgressStatus =
        completed_count === 0
          ? 'not_started'
          : completed_count === total_count
          ? 'completed'
          : 'in_progress';

      await db
        .update(userSequenceProgress)
        .set({
          status: sequenceStatus,
          completedAt: sequenceStatus === 'completed' ? new Date() : null,
          lastAccessedAt: new Date()
        })
        .where(
          and(
            eq(userSequenceProgress.userId, userId),
            eq(userSequenceProgress.sequenceId, seq.sequenceId)
          )
        );

      // If sequence is completed, check learning path progress
      if (sequenceStatus === 'completed') {
        await this.checkAndUpdateLearningPathProgress(userId, seq.sequenceId);
      }
    }
  }

  private async checkAndUpdateLearningPathProgress(
    userId: string,
    sequenceId: string
  ): Promise<void> {
    const paths = await db
      .select()
      .from(learningPathSequences)
      .where(eq(learningPathSequences.sequenceId, sequenceId));

    for (const path of paths) {
      await this.ensureProgressRecord(userId, 'path', path.learningPathId);

      const [result] = await db
        .select({
          completed_count: sql<number>`count(*) filter (where ${userSequenceProgress.status} = 'completed')`,
          total_count: sql<number>`count(*)`
        })
        .from(learningPathSequences)
        .leftJoin(
          userSequenceProgress,
          and(
            eq(userSequenceProgress.sequenceId, learningPathSequences.sequenceId),
            eq(userSequenceProgress.userId, userId)
          )
        )
        .where(eq(learningPathSequences.learningPathId, path.learningPathId));

      const completed_count = Number(result.completed_count) || 0;
      const total_count = Number(result.total_count) || 0;

      const pathStatus: ProgressStatus =
        completed_count === 0
          ? 'not_started'
          : completed_count === total_count
          ? 'completed'
          : 'in_progress';

      await db
        .update(userLearningPathProgress)
        .set({
          status: pathStatus,
          completedAt: pathStatus === 'completed' ? new Date() : null,
          lastAccessedAt: new Date()
        })
        .where(
          and(
            eq(userLearningPathProgress.userId, userId),
            eq(userLearningPathProgress.learningPathId, path.learningPathId)
          )
        );
    }
  }
} 