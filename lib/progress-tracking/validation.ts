import { z } from 'zod';

import { ValidationError, InvalidTimestampError, InvalidStatusTransitionError } from './errors';
import { ProgressStatus } from './types';

// Constants for validation
const MIN_TIMESTAMP = new Date(2020, 0, 1); // Earliest allowed timestamp
const MAX_FUTURE_DAYS = 1; // Maximum days in the future for timestamps

// Base schema for progress records with improved validation
const baseProgressRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed'] as const),
  startedAt: z.date().nullable().refine(
    (date) => !date || (date >= MIN_TIMESTAMP && date <= new Date(Date.now() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000)),
    (date) => ({
      message: date ? 'Invalid timestamp: must be between 2020 and 1 day in the future' : 'Null timestamp is allowed'
    })
  ),
  completedAt: z.date().nullable().refine(
    (date) => !date || (date >= MIN_TIMESTAMP && date <= new Date(Date.now() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000)),
    (date) => ({
      message: date ? 'Invalid timestamp: must be between 2020 and 1 day in the future' : 'Null timestamp is allowed'
    })
  ),
  lastAccessedAt: z.date().nullable().refine(
    (date) => !date || (date >= MIN_TIMESTAMP && date <= new Date(Date.now() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000)),
    (date) => ({
      message: date ? 'Invalid timestamp: must be between 2020 and 1 day in the future' : 'Null timestamp is allowed'
    })
  ),
});

// Validation for chunk progress with improved error messages
export const chunkProgressSchema = z.object({
  ...baseProgressRecordSchema.shape,
  contentChunkId: z.string().uuid({
    message: 'Content chunk ID must be a valid UUID'
  }),
}).superRefine((data, ctx) => {
  try {
    validateTimestamps(data.startedAt, data.completedAt, data.lastAccessedAt);
  } catch (error) {
    if (error instanceof InvalidTimestampError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error.message,
        path: ['timestamps']
      });
    } else {
      throw error;
    }
  }
});

// Validation for module progress with improved error messages
export const moduleProgressSchema = z.object({
  ...baseProgressRecordSchema.shape,
  moduleId: z.string().uuid({
    message: 'Module ID must be a valid UUID'
  }),
  completedChunks: z.number().min(0, {
    message: 'Completed chunks count must be non-negative'
  }),
  totalChunks: z.number().min(0, {
    message: 'Total chunks count must be non-negative'
  }),
}).refine(
  (data: { completedChunks: number; totalChunks: number }) => data.completedChunks <= data.totalChunks,
  {
    message: 'Completed chunks count cannot exceed total chunks count',
    path: ['completedChunks']
  }
);

// Validation for sequence progress with improved error messages
export const sequenceProgressSchema = z.object({
  ...baseProgressRecordSchema.shape,
  sequenceId: z.string().uuid({
    message: 'Sequence ID must be a valid UUID'
  }),
  completedModules: z.number().min(0, {
    message: 'Completed modules count must be non-negative'
  }),
  totalModules: z.number().min(0, {
    message: 'Total modules count must be non-negative'
  }),
}).refine(
  (data: { completedModules: number; totalModules: number }) => data.completedModules <= data.totalModules,
  {
    message: 'Completed modules count cannot exceed total modules count',
    path: ['completedModules']
  }
);

// Validation for learning path progress with improved error messages
export const learningPathProgressSchema = z.object({
  ...baseProgressRecordSchema.shape,
  learningPathId: z.string().uuid({
    message: 'Learning path ID must be a valid UUID'
  }),
  completedSequences: z.number().min(0, {
    message: 'Completed sequences count must be non-negative'
  }),
  totalSequences: z.number().min(0, {
    message: 'Total sequences count must be non-negative'
  }),
}).refine(
  (data: { completedSequences: number; totalSequences: number }) => data.completedSequences <= data.totalSequences,
  {
    message: 'Completed sequences count cannot exceed total sequences count',
    path: ['completedSequences']
  }
);

// Validation for progress status transitions with improved error handling
const validTransitions: Record<ProgressStatus, ProgressStatus[]> = {
  'not_started': ['in_progress'],
  'in_progress': ['completed', 'not_started'], // Allow resetting to not_started
  'completed': ['in_progress'] // Allow going back to in_progress if needed
};

export function validateStatusTransition(currentStatus: ProgressStatus, newStatus: ProgressStatus): boolean {
  if (!Object.keys(validTransitions).includes(currentStatus)) {
    throw new ValidationError(`Invalid current status: ${currentStatus}`);
  }
  if (!Object.keys(validTransitions).includes(newStatus)) {
    throw new ValidationError(`Invalid new status: ${newStatus}`);
  }
  const allowedTransitions = validTransitions[currentStatus];
  if (currentStatus === newStatus || allowedTransitions.includes(newStatus)) {
    return true;
  }
  throw new InvalidStatusTransitionError(currentStatus, newStatus);
}

// Validation for progress update options with improved error messages
export const progressUpdateOptionsSchema = z.object({
  updateParents: z.boolean().optional().default(true),
  deferChunkUpdates: z.boolean().optional().default(false),
  validateTimestamps: z.boolean().optional().default(true),
});

// Helper function to validate progress records with improved error handling
export function validateProgressRecord<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Progress record validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
}

// Helper function to ensure timestamps are in correct order with improved validation
export function validateTimestamps(startedAt: Date | null, completedAt: Date | null, lastAccessedAt: Date | null): void {
  // Check if timestamps are within valid range
  const now = new Date();
  const maxFutureDate = new Date(now.getTime() + MAX_FUTURE_DAYS * 24 * 60 * 60 * 1000);

  const isValidDate = (date: Date | null) => {
    return !date || (date >= MIN_TIMESTAMP && date <= maxFutureDate);
  };

  if (!isValidDate(startedAt) || !isValidDate(completedAt) || !isValidDate(lastAccessedAt)) {
    throw new InvalidTimestampError('Timestamps must be between 2020 and 1 day in the future');
  }

  // Check timestamp order
  if (completedAt && !startedAt) {
    throw new InvalidTimestampError('Cannot have completedAt without startedAt');
  }
  if (startedAt && completedAt && startedAt > completedAt) {
    throw new InvalidTimestampError('startedAt cannot be after completedAt');
  }
  if (lastAccessedAt) {
    if (startedAt && lastAccessedAt < startedAt) {
      throw new InvalidTimestampError('lastAccessedAt cannot be before startedAt');
    }
    if (completedAt && lastAccessedAt < completedAt) {
      throw new InvalidTimestampError('lastAccessedAt cannot be before completedAt');
    }
  }
} 