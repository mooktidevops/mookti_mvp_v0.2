import { jest } from '@jest/globals';
import { ProgressTrackingService } from '@/lib/progress-tracking/progress-service';
import { ProgressStatus } from '@/lib/progress-tracking/types';
import {
  ContentNotFoundError,
  DatabaseError,
  InvalidStatusTransitionError
} from '@/lib/progress-tracking/errors';

// A mock DB interface that supports .set(), .values(), etc.
type MockDB = {
  select: jest.Mock<any>;
  insert: jest.Mock<any>;
  update: jest.Mock<any>;
  set: jest.Mock<any>;
  values: jest.Mock<any>;
  from: jest.Mock<any>;
  where: jest.Mock<any>;
  limit: jest.Mock<any>;
  execute: jest.Mock<() => Promise<any[]>>;
  transaction: jest.Mock<any>;
};

jest.mock('@/db', () => {
  const createMockDb = (): MockDB => {
    const mockDb: MockDB = {
      select: jest.fn(() => mockDb),
      insert: jest.fn(() => mockDb),
      update: jest.fn(() => mockDb),
      set: jest.fn(() => mockDb),
      values: jest.fn(() => mockDb),
      from: jest.fn(() => mockDb),
      where: jest.fn(() => mockDb),
      limit: jest.fn(() => mockDb),
      execute: jest.fn(() => Promise.resolve([])),
      transaction: jest.fn((cb: any) => Promise.resolve(cb(mockDb)))
    };
    return mockDb;
  };
  return { db: createMockDb() };
});

describe('ProgressTrackingService Error Handling', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockChunkId = '123e4567-e89b-12d3-a456-426614174001';

  let service: ProgressTrackingService;
  let mockDb: MockDB;

  beforeEach(() => {
    jest.resetModules();
    const { db } = require('@/db');
    mockDb = db;
    service = new ProgressTrackingService();
    mockDb.execute.mockClear();
  });

  it('should throw ContentNotFoundError when content chunk does not exist', async () => {
    // Intentionally return [] for the chunk on the very first call
    mockDb.execute.mockImplementationOnce(() => Promise.resolve([]));

    await expect(
      service.updateChunkProgress(mockUserId, mockChunkId, 'in_progress' as ProgressStatus)
    ).rejects.toThrow(ContentNotFoundError);
  });

  it('should throw InvalidStatusTransitionError for invalid status transitions', async () => {
    /**
     * We’ll do:
     * - chunk always found
     * - on 1st chunk check => found
     * - on 2nd user chunk progress => 'not_started'
     * - code sees user chunk progress 'not_started' => newStatus='completed' => invalid
     *
     * Then we keep returning found for subsequent calls so we never get ContentNotFoundError.
     */
    let callCount = 0;

    mockDb.execute.mockImplementation(() => {
      callCount++;

      // Always-found placeholders
      const chunkFound = [{ id: mockChunkId, module_id: 'module-abc' }];
      const moduleFound = [{ id: 'module-abc' }];
      const moduleProgress = [{ id: 'module-prog-1', status: 'in_progress' }];
      const sequenceFound = [{ id: 'sequence-xyz' }];
      const sequenceProgress = [{ id: 'seq-prog-1', status: 'in_progress' }];

      switch (callCount) {
        // 1) chunk => found
        case 1:
          return Promise.resolve(chunkFound);
        // 2) user chunk progress => 'not_started'
        case 2:
          return Promise.resolve([{ id: 'chunk-progress-1', status: 'not_started' }]);
        // 3) maybe re-check => 'not_started'
        case 3:
          return Promise.resolve([{ id: 'chunk-progress-1', status: 'not_started' }]);
        // 4) DB update success, but code sees 'not_started' -> 'completed' => invalid transition
        case 4:
          return Promise.resolve([]);

        // Past this, code might do checkAndUpdateModuleProgress, ensureProgressRecord(...):
        // 5..20 => always found
        case 5:
          // chunk again => found
          return Promise.resolve(chunkFound);
        case 6:
          // module => found
          return Promise.resolve(moduleFound);
        case 7:
          // userModuleProgress => in_progress
          return Promise.resolve(moduleProgress);
        case 8:
          // re-check => same
          return Promise.resolve(moduleProgress);
        case 9:
          // update => success
          return Promise.resolve([]);
        case 10:
          // re-check => same
          return Promise.resolve(moduleProgress);
        case 11:
          // sequence => found
          return Promise.resolve(sequenceFound);
        case 12:
          // userSequenceProgress => in_progress
          return Promise.resolve(sequenceProgress);
        case 13:
          // update => success
          return Promise.resolve([]);
        case 14:
          // re-check => same
          return Promise.resolve(sequenceProgress);
        case 15:
          // etc...
          return Promise.resolve(chunkFound);

        default:
          // default => always chunk found
          return Promise.resolve(chunkFound);
      }
    });

    await expect(
      service.updateChunkProgress(mockUserId, mockChunkId, 'completed' as ProgressStatus)
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should throw DatabaseError when database operations fail', async () => {
    /**
     * We'll always return chunk => found, user chunk progress => 'in_progress',
     * then on some call (say #4), we'll reject with new Error('Database error').
     * That triggers DatabaseError in your code.
     */
    let callCount = 0;

    mockDb.execute.mockImplementation(() => {
      callCount++;

      // Always-found placeholders
      const chunkFound = [{ id: mockChunkId, module_id: 'module-xyz' }];
      const moduleFound = [{ id: 'module-xyz' }];
      const moduleProgress = [{ id: 'module-prog-2', status: 'in_progress' }];
      const sequenceFound = [{ id: 'sequence-222' }];
      const sequenceProgress = [{ id: 'seq-prog-222', status: 'in_progress' }];

      switch (callCount) {
        // 1) chunk => found
        case 1:
          return Promise.resolve(chunkFound);
        // 2) user chunk progress => 'in_progress'
        case 2:
          return Promise.resolve([{ id: 'chunk-progress-2', status: 'in_progress' }]);
        // 3) re-check => 'in_progress'
        case 3:
          return Promise.resolve([{ id: 'chunk-progress-2', status: 'in_progress' }]);
        // 4) final update => fails => triggers DatabaseError
        case 4:
          return Promise.reject(new Error('Database error'));

        // 5..20 => always found
        case 5:
          // chunk => found
          return Promise.resolve(chunkFound);
        case 6:
          // module => found
          return Promise.resolve(moduleFound);
        case 7:
          // userModuleProgress => in_progress
          return Promise.resolve(moduleProgress);
        case 8:
          return Promise.resolve(moduleProgress);
        case 9:
          // update => success
          return Promise.resolve([]);
        case 10:
          // re-check => same
          return Promise.resolve(moduleProgress);
        case 11:
          // sequence => found
          return Promise.resolve(sequenceFound);
        case 12:
          // userSequenceProgress => in_progress
          return Promise.resolve(sequenceProgress);
        case 13:
          // update => success
          return Promise.resolve([]);
        case 14:
          return Promise.resolve(sequenceProgress);

        default:
          // default => chunk found
          return Promise.resolve(chunkFound);
      }
    });

    await expect(
      service.updateChunkProgress(mockUserId, mockChunkId, 'completed' as ProgressStatus)
    ).rejects.toThrow(DatabaseError);
  });
});