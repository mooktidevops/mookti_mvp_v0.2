import { jest } from '@jest/globals';
import { ProgressTrackingService } from '@/lib/progress-tracking/progress-service';
import { ProgressStatus } from '@/lib/progress-tracking/types';
import { db } from '@/db';

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

describe('ProgressTrackingService', () => {
  let service: ProgressTrackingService;
  let mockDb: MockDB;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockChunkId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProgressTrackingService();
    mockDb = (jest.requireMock('@/db') as any).db;
    mockDb.execute.mockClear();
  });

  it('should create new progress record with in_progress status', async () => {
    // 1) chunk => found
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([{ id: mockChunkId, module_id: 'some-module-id' }])
    );
    // 2) user progress => none => []
    mockDb.execute.mockImplementationOnce(() => Promise.resolve([]));
    // 3) insert => success
    mockDb.execute.mockImplementationOnce(() => Promise.resolve([]));
    // 4) re-check => now not_started
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: 'new-progress-id',
          userId: mockUserId,
          contentChunkId: mockChunkId,
          status: 'not_started'
        }
      ])
    );
    // 5) update => success
    mockDb.execute.mockImplementationOnce(() => Promise.resolve([]));
    // 6) final re-check => in_progress
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: 'new-progress-id',
          userId: mockUserId,
          contentChunkId: mockChunkId,
          status: 'in_progress',
          startedAt: new Date(),
          completedAt: null
        }
      ])
    );

    const result = await service.updateChunkProgress(
      mockUserId,
      mockChunkId,
      'in_progress' as ProgressStatus
    );

    expect(result.status).toBe('in_progress');
  });

  it('should update existing progress record from in_progress to completed', async () => {
    // 1) chunk => found
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([
        { id: mockChunkId, module_id: 'some-module-id' }
      ])
    );
    // 2) user progress => 'in_progress'
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([
        { id: 'existing-id', userId: mockUserId, contentChunkId: mockChunkId, status: 'in_progress' }
      ])
    );
    // 3) re-check => still 'in_progress'
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([
        { id: 'existing-id', userId: mockUserId, contentChunkId: mockChunkId, status: 'in_progress' }
      ])
    );
    // 4) update => success
    mockDb.execute.mockImplementationOnce(() => Promise.resolve([]));
    // 5) final re-check => 'completed'
    mockDb.execute.mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: 'existing-id',
          userId: mockUserId,
          contentChunkId: mockChunkId,
          status: 'completed',
          startedAt: new Date(Date.now() - 60_000),
          completedAt: new Date()
        }
      ])
    );

    const result = await service.updateChunkProgress(
      mockUserId,
      mockChunkId,
      'completed' as ProgressStatus
    );
    expect(result.status).toBe('completed');
  });
});