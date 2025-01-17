import { and, eq, sql } from 'drizzle-orm/sql';
import { z } from 'zod';
import { randomUUID } from 'crypto';

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
      const grouped = this.updates.reduce((acc, update) => {
        const key = `${update.userId}-${update.contentChunkId}`;
        // keep the most recent if multiple updates for same chunk
        if (!acc[key] || acc[key].timestamp < update.timestamp) {
          acc[key] = update;
        }
        return acc;
      }, {} as Record<string, DeferredChunkUpdate>);

      await Promise.all(
        Object.values(grouped).map(async update => {
          try {
            const existingProgress = await db
              .select()
              .from(userContentChunkProgress)
              .where(
                and(
                  eq(userContentChunkProgress.userId, update.userId),
                  eq(userContentChunkProgress.contentChunkId, update.contentChunkId)
                )
              )
              .limit(1)
              .execute();

            if (existingProgress[0]) {
              const currentStatus = existingProgress[0].status as ProgressStatus;
              if (!validateStatusTransition(currentStatus, update.status)) {
                throw new InvalidStatusTransitionError(currentStatus, update.status);
              }
            }

            // Use .set(...) for updates
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
              )
              .execute();
          } catch (error) {
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
        throw new ValidationError(
          `Invalid input parameters: ${error.errors.map(e => e.message).join(', ')}`
        );
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
          // Check chunk existence
          const contentRow = await db
            .select()
            .from(contentChunks)
            .where(eq(contentChunks.id, contentId))
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!contentRow) {
            throw new ContentNotFoundError('Content chunk', contentId);
          }

          // Check user progress
          const existing = await db
            .select()
            .from(userContentChunkProgress)
            .where(
              and(
                eq(userContentChunkProgress.userId, userId),
                eq(userContentChunkProgress.contentChunkId, contentId)
              )
            )
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!existing) {
            // create a new record
            const newRecord = {
              userId,
              contentChunkId: contentId,
              status: 'not_started' as const,
              startedAt: null,
              completedAt: null,
              lastAccessedAt: timestamp
            };

            // chunkProgressSchema requires an id, so pass randomUUID
            try {
              validateProgressRecord(chunkProgressSchema, {
                ...newRecord,
                id: randomUUID()
              });
            } catch (error) {
              throw new ValidationError(
                error instanceof Error ? error.message : String(error)
              );
            }

            await db
              .insert(userContentChunkProgress)
              .values([ newRecord ]) // array form
              .execute();
          }
          break;
        }

        case 'module': {
          const moduleRow = await db
            .select()
            .from(modules)
            .where(eq(modules.id, contentId))
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!moduleRow) {
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
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!existing) {
            await db
              .insert(userModuleProgress)
              .values([{
                userId,
                moduleId: contentId,
                status: 'not_started'
              }])
              .execute();
          }
          break;
        }

        case 'sequence': {
          const sequenceRow = await db
            .select()
            .from(sequences)
            .where(eq(sequences.id, contentId))
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!sequenceRow) {
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
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!existing) {
            await db
              .insert(userSequenceProgress)
              .values([{
                userId,
                sequenceId: contentId,
                status: 'not_started'
              }])
              .execute();
          }
          break;
        }

        case 'path': {
          const pathRow = await db
            .select()
            .from(learningPaths)
            .where(eq(learningPaths.id, contentId))
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!pathRow) {
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
            .limit(1)
            .execute()
            .then(rows => rows[0]);

          if (!existing) {
            await db
              .insert(userLearningPathProgress)
              .values([{
                userId,
                learningPathId: contentId,
                status: 'not_started'
              }])
              .execute();
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
      // ensure record
      await this.ensureProgressRecord(userId, 'chunk', contentChunkId);

      // re-check progress
      const current = await db
        .select()
        .from(userContentChunkProgress)
        .where(
          and(
            eq(userContentChunkProgress.userId, userId),
            eq(userContentChunkProgress.contentChunkId, contentChunkId)
          )
        )
        .limit(1)
        .execute()
        .then(rows => rows[0]);

      if (!current) {
        throw new DatabaseError('select', new Error('Progress record not found after ensuring it exists'));
      }

      if (!validateStatusTransition(current.status as ProgressStatus, newStatus)) {
        throw new InvalidStatusTransitionError(current.status, newStatus);
      }

      const timestamp = new Date();
      const updateData: Partial<ChunkProgress> = {
        status: newStatus,
        lastAccessedAt: timestamp,
        updatedAt: timestamp
      };
      if (newStatus === 'in_progress' && current.status === 'not_started') {
        updateData.startedAt = timestamp;
      } else if (newStatus === 'completed') {
        updateData.completedAt = timestamp;
      }

      try {
        await db
          .update(userContentChunkProgress)
          .set(updateData)  // use .set for updates
          .where(
            and(
              eq(userContentChunkProgress.userId, userId),
              eq(userContentChunkProgress.contentChunkId, contentChunkId)
            )
          )
          .execute();

        // final re-check
        const updated = await db
          .select()
          .from(userContentChunkProgress)
          .where(
            and(
              eq(userContentChunkProgress.userId, userId),
              eq(userContentChunkProgress.contentChunkId, contentChunkId)
            )
          )
          .limit(1)
          .execute()
          .then(rows => rows[0]);

        if (!updated) {
          throw new DatabaseError('select', new Error('Updated progress record not found'));
        }

        if (options.updateParents && newStatus === 'completed') {
          await this.checkAndUpdateModuleProgress(userId, contentChunkId);
        }

        return updated as ChunkProgress;
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

  private async checkAndUpdateModuleProgress(userId: string, chunkId: string): Promise<void> {
    const chunk = await db
      .select()
      .from(contentChunks)
      .where(eq(contentChunks.id, chunkId))
      .limit(1)
      .execute()
      .then(rows => rows[0]);

    if (!chunk) return;

    const moduleId = chunk.module_id;
    await this.ensureProgressRecord(userId, 'module', moduleId);

    const result = await db
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
      .where(eq(contentChunks.module_id, moduleId))
      .execute()
      .then(rows => rows[0]);

    const completed_count = Number(result?.completed_count ?? 0);
    const total_count = Number(result?.total_count ?? 0);
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
      )
      .execute();

    if (moduleStatus === 'completed') {
      await this.checkAndUpdateSequenceProgress(userId, moduleId);
    }
  }

  private async checkAndUpdateSequenceProgress(userId: string, moduleId: string): Promise<void> {
    const seqRows = await db
      .select()
      .from(sequenceModules)
      .where(eq(sequenceModules.moduleId, moduleId))
      .execute();

    for (const seq of seqRows) {
      await this.ensureProgressRecord(userId, 'sequence', seq.sequenceId);

      const result = await db
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
        .where(eq(sequenceModules.sequenceId, seq.sequenceId))
        .execute()
        .then(rows => rows[0]);

      const completed_count = Number(result?.completed_count ?? 0);
      const total_count = Number(result?.total_count ?? 0);
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
        )
        .execute();

      if (sequenceStatus === 'completed') {
        await this.checkAndUpdateLearningPathProgress(userId, seq.sequenceId);
      }
    }
  }

  private async checkAndUpdateLearningPathProgress(userId: string, sequenceId: string): Promise<void> {
    const pathRows = await db
      .select()
      .from(learningPathSequences)
      .where(eq(learningPathSequences.sequenceId, sequenceId))
      .execute();

    for (const path of pathRows) {
      await this.ensureProgressRecord(userId, 'path', path.learningPathId);

      const result = await db
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
        .where(eq(learningPathSequences.learningPathId, path.learningPathId))
        .execute()
        .then(rows => rows[0]);

      const completed_count = Number(result?.completed_count ?? 0);
      const total_count = Number(result?.total_count ?? 0);
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
        )
        .execute();
    }
  }
}