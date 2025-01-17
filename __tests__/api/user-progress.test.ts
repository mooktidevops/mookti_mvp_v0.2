import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextResponse } from 'next/server';
import { DefaultSession } from 'next-auth';
import { GetServerSidePropsContext } from 'next';

// Create properly typed mock functions
type UpdateChunkProgressFn = (
  userId: string,
  contentChunkId: string,
  status: ProgressStatus,
  options?: ProgressUpdateOptions
) => Promise<void>;

type AuthFn = () => Promise<{
  user: { id: string; email: string; role: string } | null;
  expires: string;
}>;

type GetLastAccessedContentFn = () => Promise<LastAccessedContent>;

const mockUpdateChunkProgress = jest.fn() as jest.MockedFunction<UpdateChunkProgressFn>;
const mockAuth = jest.fn() as jest.MockedFunction<AuthFn>;
const mockGetLastAccessedContent = jest.fn() as jest.MockedFunction<GetLastAccessedContentFn>;

// Mock dependencies with proper types
jest.mock('@/lib/auth', () => ({
  auth: () => mockAuth()
}));

jest.mock('@/lib/progress-tracking/last-accessed', () => ({
  getLastAccessedContent: () => mockGetLastAccessedContent()
}));

jest.mock('@/lib/progress-tracking/progress-service', () => {
  const mockProgressQueue = {
    flush: jest.fn().mockImplementation(() => Promise.resolve())
  };

  const MockProgressTrackingService = jest.fn().mockImplementation(() => ({
    updateChunkProgress: mockUpdateChunkProgress
  }));

  return {
    ProgressTrackingService: MockProgressTrackingService,
    progressQueue: mockProgressQueue
  };
});

import { GET, POST, DELETE } from '@/app/api/user-progress/route';
import { auth } from '@/lib/auth';
import {
  ValidationError,
  DatabaseError,
  InvalidStatusTransitionError,
  ContentNotFoundError
} from '@/lib/progress-tracking/errors';
import { getLastAccessedContent } from '@/lib/progress-tracking/last-accessed';
import { ProgressTrackingService, progressQueue } from '@/lib/progress-tracking/progress-service';
import { LastAccessedContent, ProgressStatus, ProgressUpdateOptions } from '@/lib/progress-tracking/types';

// Extend the built-in session type
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
    } | null;
  }
}

describe('User Progress API', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockChunkId = '123e4567-e89b-12d3-a456-426614174001';
  const mockDateStr = '2025-01-07T23:05:09.181Z';
  const mockDateObj = new Date(mockDateStr);

  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      role: 'user'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  const mockLastAccessedContent: LastAccessedContent = {
    chunk: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      userId: mockUserId,
      contentChunkId: '123e4567-e89b-12d3-a456-426614174002',
      status: 'completed' as ProgressStatus,
      startedAt: mockDateObj,
      completedAt: mockDateObj,
      lastAccessedAt: mockDateObj,
      createdAt: mockDateObj,
      updatedAt: mockDateObj
    },
    module: {
      id: '123e4567-e89b-12d3-a456-426614174003',
      userId: mockUserId,
      moduleId: '123e4567-e89b-12d3-a456-426614174004',
      status: 'completed' as ProgressStatus,
      startedAt: mockDateObj,
      completedAt: mockDateObj,
      lastAccessedAt: mockDateObj,
      completedChunks: 5,
      totalChunks: 5,
      createdAt: mockDateObj,
      updatedAt: mockDateObj
    },
    sequence: {
      id: '123e4567-e89b-12d3-a456-426614174005',
      userId: mockUserId,
      sequenceId: '123e4567-e89b-12d3-a456-426614174006',
      status: 'completed' as ProgressStatus,
      startedAt: mockDateObj,
      completedAt: mockDateObj,
      lastAccessedAt: mockDateObj,
      completedModules: 3,
      totalModules: 3,
      createdAt: mockDateObj,
      updatedAt: mockDateObj
    },
    learningPath: {
      id: '123e4567-e89b-12d3-a456-426614174007',
      userId: mockUserId,
      learningPathId: '123e4567-e89b-12d3-a456-426614174008',
      status: 'in_progress' as ProgressStatus,
      startedAt: mockDateObj,
      completedAt: null,
      lastAccessedAt: mockDateObj,
      completedSequences: 2,
      totalSequences: 4,
      createdAt: mockDateObj,
      updatedAt: mockDateObj
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue(mockSession);
    mockGetLastAccessedContent.mockResolvedValue(mockLastAccessedContent);
    mockUpdateChunkProgress.mockReset();
  });

  describe('GET /api/user-progress', () => {
    it('should return last accessed content', async () => {
      const request = new Request('http://localhost/api/user-progress?type=last_accessed');
      const response = await GET(request);
      const responseData = await response.json();

      // Convert dates to strings for comparison
      const expectedData = JSON.parse(JSON.stringify(mockLastAccessedContent));
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(responseData).toEqual(expectedData);
    });

    it('should handle unauthorized requests', async () => {
      const unauthSession = {
        user: null,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      mockAuth.mockResolvedValueOnce(unauthSession);

      const request = new Request('http://localhost/api/user-progress?type=last_accessed');
      const response = await GET(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
    });

    it('should handle invalid request types', async () => {
      const request = new Request('http://localhost/api/user-progress?type=invalid');
      const response = await GET(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should handle database errors', async () => {
      mockGetLastAccessedContent.mockRejectedValueOnce(
        new DatabaseError('select', new Error('DB error'))
      );

      const request = new Request('http://localhost/api/user-progress?type=last_accessed');
      const response = await GET(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(503);
    });
  });

  describe('POST /api/user-progress', () => {
    const mockChunkId = '123e4567-e89b-12d3-a456-426614174001';
    const validBody = {
      contentChunkId: mockChunkId,
      status: 'in_progress',
      updateParents: true
    };

    it('should update progress successfully', async () => {
      // @ts-ignore - Mock implementation type mismatch is expected
      mockUpdateChunkProgress.mockResolvedValueOnce(undefined);

      const request = new Request('http://localhost/api/user-progress', {
        method: 'POST',
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(mockUpdateChunkProgress).toHaveBeenCalledWith(
        mockUserId,
        mockChunkId,
        'in_progress',
        { updateParents: true }
      );
    });

    it('should handle validation errors', async () => {
      const request = new Request('http://localhost/api/user-progress', {
        method: 'POST',
        body: JSON.stringify({ ...validBody, status: 'invalid' })
      });

      const response = await POST(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should handle invalid status transitions', async () => {
      // @ts-ignore - Mock implementation type mismatch is expected
      mockUpdateChunkProgress.mockRejectedValueOnce(
        new InvalidStatusTransitionError('not_started', 'completed')
      );

      const request = new Request('http://localhost/api/user-progress', {
        method: 'POST',
        body: JSON.stringify({ ...validBody, status: 'completed' })
      });

      const response = await POST(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should handle content not found', async () => {
      // @ts-ignore - Mock implementation type mismatch is expected
      mockUpdateChunkProgress.mockRejectedValueOnce(
        new ContentNotFoundError('chunk', mockChunkId)
      );

      const request = new Request('http://localhost/api/user-progress', {
        method: 'POST',
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
    });

    it('should handle database errors', async () => {
      // @ts-ignore - Mock implementation type mismatch is expected
      mockUpdateChunkProgress.mockRejectedValueOnce(
        new DatabaseError('update', new Error('DB error'))
      );

      const request = new Request('http://localhost/api/user-progress', {
        method: 'POST',
        body: JSON.stringify(validBody)
      });

      const response = await POST(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(503);
    });
  });

  describe('DELETE /api/user-progress', () => {
    it('should flush the progress queue', async () => {
      const request = new Request('http://localhost/api/user-progress', {
        method: 'DELETE'
      });

      const response = await DELETE(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(progressQueue.flush).toHaveBeenCalled();
    });

    it('should handle database errors during flush', async () => {
      jest.mocked(progressQueue.flush).mockRejectedValueOnce(
        new DatabaseError('flush', new Error('DB error'))
      );

      const request = new Request('http://localhost/api/user-progress', {
        method: 'DELETE'
      });

      const response = await DELETE(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(503);
    });
  });
}); 