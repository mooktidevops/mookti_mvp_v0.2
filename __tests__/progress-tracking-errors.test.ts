import { jest } from '@jest/globals';
import { ProgressTrackingService } from '@/lib/progress-tracking/progress-service';
import { ProgressStatus } from '@/lib/progress-tracking/types';
import { ContentNotFoundError, DatabaseError, InvalidStatusTransitionError } from '@/lib/progress-tracking/errors';

jest.mock('@/db', () => {
  type MockDbType = {
    select: jest.Mock<any>;
    insert: jest.Mock<any>;
    update: jest.Mock<any>;
    from: jest.Mock<any>;
    where: jest.Mock<any>;
    values: jest.Mock<any>;
    set: jest.Mock<any>;
    limit: jest.Mock<any>;
    transaction: jest.Mock<any>;
    _setResults: (operation: string, results: any[]) => void;
    _setError: (operation: string, error: Error) => void;
  };

  const createMockDb = (): MockDbType => {
    const mockDb: MockDbType = {
      select: jest.fn(() => mockDb),
      insert: jest.fn(() => mockDb),
      update: jest.fn(() => mockDb),
      from: jest.fn(() => mockDb),
      where: jest.fn(() => mockDb),
      values: jest.fn(() => mockDb),
      set: jest.fn(() => mockDb),
      limit: jest.fn(() => mockDb),
      transaction: jest.fn((cb: any) => Promise.resolve(cb(mockDb))),
      _setResults(operation: string, results: any[]): void {
        if (operation === 'select') {
          this.limit.mockImplementation(() => Promise.resolve(results));
        } else if (operation === 'insert') {
          this.values.mockImplementation(() => Promise.resolve(results));
        } else if (operation === 'update') {
          this.where.mockImplementation(() => Promise.resolve(results));
        }
      },
      _setError(operation: string, error: Error): void {
        if (operation === 'select') {
          this.limit.mockImplementation(() => Promise.reject(error));
        } else if (operation === 'insert') {
          this.values.mockImplementation(() => Promise.reject(error));
        } else if (operation === 'update') {
          this.where.mockImplementation(() => Promise.reject(error));
        }
      }
    };

    // Set up default implementations for method chaining
    mockDb.select.mockImplementation(() => mockDb);
    mockDb.insert.mockImplementation(() => mockDb);
    mockDb.update.mockImplementation(() => mockDb);
    mockDb.from.mockImplementation(() => mockDb);
    mockDb.where.mockImplementation(() => mockDb);
    mockDb.values.mockImplementation(() => mockDb);
    mockDb.set.mockImplementation(() => mockDb);
    mockDb.limit.mockImplementation(() => Promise.resolve([]));

    return mockDb;
  };

  return { db: createMockDb() };
});

describe('ProgressTrackingService Error Handling', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockChunkId = '123e4567-e89b-12d3-a456-426614174001';
  let service: ProgressTrackingService;
  let mockDb: any;

  beforeEach(() => {
    jest.resetModules();
    const { db } = require('@/db');
    mockDb = db;
    service = new ProgressTrackingService();
  });

  it('should throw ContentNotFoundError when content chunk does not exist', async () => {
    // Mock content chunk does not exist
    mockDb._setResults('select', []);

    await expect(
      service.updateChunkProgress(mockUserId, mockChunkId, 'in_progress' as ProgressStatus)
    ).rejects.toThrow(ContentNotFoundError);
  });

  it('should throw InvalidStatusTransitionError for invalid status transitions', async () => {
    // Mock content chunk exists
    mockDb._setResults('select', [{ id: mockChunkId }]);

    // Mock existing progress with not_started status
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      lastAccessedAt: new Date()
    }]);

    // Mock update operation
    mockDb._setResults('update', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'completed',
      startedAt: null,
      completedAt: new Date(),
      lastAccessedAt: new Date()
    }]);

    await expect(
      service.updateChunkProgress(mockUserId, mockChunkId, 'completed' as ProgressStatus)
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should throw DatabaseError when database operations fail', async () => {
    // Mock content chunk exists
    mockDb._setResults('select', [{ id: mockChunkId }]);

    // Mock existing progress
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'in_progress',
      startedAt: new Date(),
      completedAt: null,
      lastAccessedAt: new Date()
    }]);

    // Mock database error
    mockDb._setError('update', new Error('Database error'));

    await expect(
      service.updateChunkProgress(mockUserId, mockChunkId, 'completed' as ProgressStatus)
    ).rejects.toThrow(DatabaseError);
  });
}); 