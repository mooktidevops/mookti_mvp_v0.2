import { jest } from '@jest/globals';
import { ProgressTrackingService } from '@/lib/progress-tracking/progress-service';
import { ProgressStatus, ChunkProgress } from '@/lib/progress-tracking/types';
import { db } from '@/db';
import { contentChunks, userContentChunkProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Create a mock database type that matches drizzle-orm structure
type MockDB = {
  select: jest.Mock<any>;
  insert: jest.Mock<any>;
  update: jest.Mock<any>;
  from: jest.Mock<any>;
  where: jest.Mock<any>;
  values: jest.Mock<any>;
  set: jest.Mock<any>;
  limit: jest.Mock<any>;
  transaction: jest.Mock<any>;
  _results: Map<string, any[]>;
  _setResults: (operation: string, results: any[]) => void;
  _setError: (operation: string, error: Error) => void;
};

// Mock the database module
jest.mock('@/db', () => {
  const createMockDb = (): MockDB => {
    const mockDb: MockDB = {
      select: jest.fn(() => mockDb),
      insert: jest.fn(() => mockDb),
      update: jest.fn(() => mockDb),
      from: jest.fn(() => mockDb),
      where: jest.fn(() => mockDb),
      values: jest.fn(() => mockDb),
      set: jest.fn(() => mockDb),
      limit: jest.fn(() => mockDb),
      transaction: jest.fn((cb: any) => Promise.resolve(cb(mockDb))),
      _results: new Map<string, any[]>(),
      _setResults(operation: string, results: any[]): void {
        this._results.set(operation, results);
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

describe('ProgressTrackingService', () => {
  let service: ProgressTrackingService;
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockChunkId = '123e4567-e89b-12d3-a456-426614174001';
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProgressTrackingService();
    mockDb = (jest.requireMock('@/db') as any).db;
  });

  it('should create new progress record with in_progress status', async () => {
    const now = new Date();
    const mockProgress = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'in_progress' as ProgressStatus,
      startedAt: now,
      completedAt: null,
      lastAccessedAt: now,
      createdAt: now,
      updatedAt: now
    };

    // Mock content chunk exists
    mockDb._setResults('select', [{ id: mockChunkId }]);
    // Mock no existing progress
    mockDb._setResults('select', []);
    // Mock insert operation
    mockDb._setResults('insert', [mockProgress]);
    // Mock select after insert
    mockDb._setResults('select', [mockProgress]);

    await service.updateChunkProgress(mockUserId, mockChunkId, 'in_progress' as ProgressStatus);

    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'in_progress',
      startedAt: expect.any(Date),
      completedAt: null,
      lastAccessedAt: expect.any(Date)
    }));
  });

  it('should update existing progress record from in_progress to completed', async () => {
    const now = new Date();
    const startedAt = new Date(now.getTime() - 60000); // 1 minute ago
    const lastAccessedAt = new Date(now.getTime() - 30000); // 30 seconds ago

    // Mock content chunk exists
    mockDb._setResults('select', [{ id: mockChunkId }]);

    // Mock existing progress
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'in_progress' as ProgressStatus,
      startedAt,
      completedAt: null,
      lastAccessedAt,
      createdAt: startedAt,
      updatedAt: lastAccessedAt
    }]);

    // Mock update operation
    mockDb._setResults('update', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'completed',
      startedAt: expect.any(Date),
      completedAt: expect.any(Date),
      lastAccessedAt: expect.any(Date)
    }]);

    // Mock select after update
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'completed',
      startedAt: expect.any(Date),
      completedAt: expect.any(Date),
      lastAccessedAt: expect.any(Date)
    }]);

    await service.updateChunkProgress(mockUserId, mockChunkId, 'completed' as ProgressStatus);

    expect(mockDb.set).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
      status: 'completed',
      completedAt: expect.any(Date),
      lastAccessedAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }));
  });

  it('should update lastAccessedAt when status remains the same', async () => {
    const now = new Date();
    const startedAt = new Date(now.getTime() - 60000); // 1 minute ago
    const lastAccessedAt = new Date(now.getTime() - 30000); // 30 seconds ago

    // Mock content chunk exists
    mockDb._setResults('select', [{ id: mockChunkId }]);

    // Mock existing progress
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'in_progress' as ProgressStatus,
      startedAt,
      completedAt: null,
      lastAccessedAt,
      createdAt: startedAt,
      updatedAt: lastAccessedAt
    }]);

    await service.updateChunkProgress(mockUserId, mockChunkId, 'in_progress' as ProgressStatus);

    expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({
      lastAccessedAt: expect.any(Date),
      updatedAt: expect.any(Date)
    }));
  });

  it('should handle updateParents option', async () => {
    const now = new Date();

    // Mock content chunk exists
    mockDb._setResults('select', [{ id: mockChunkId }]);

    // Mock existing progress
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'in_progress' as ProgressStatus,
      startedAt: new Date(now.getTime() - 60000),
      completedAt: null,
      lastAccessedAt: now
    }]);

    // Mock parent chunks query
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174003',
      parentId: null
    }]);

    // Mock update operation
    mockDb._setResults('update', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'completed',
      startedAt: expect.any(Date),
      completedAt: expect.any(Date),
      lastAccessedAt: expect.any(Date)
    }]);

    // Mock select after update
    mockDb._setResults('select', [{
      id: '123e4567-e89b-12d3-a456-426614174002',
      userId: mockUserId,
      contentChunkId: mockChunkId,
      status: 'completed',
      startedAt: expect.any(Date),
      completedAt: expect.any(Date),
      lastAccessedAt: expect.any(Date)
    }]);

    await service.updateChunkProgress(mockUserId, mockChunkId, 'completed' as ProgressStatus, { updateParents: true });

    // Verify the update was called
    expect(mockDb.set).toHaveBeenCalled();
  });
}); 