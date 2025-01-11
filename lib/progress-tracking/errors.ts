export class ProgressTrackingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressTrackingError';
  }
}

export class InvalidStatusTransitionError extends ProgressTrackingError {
  constructor(currentStatus: string, newStatus: string) {
    super(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class InvalidTimestampError extends ProgressTrackingError {
  constructor(message: string) {
    super(`Invalid timestamp sequence: ${message}`);
    this.name = 'InvalidTimestampError';
  }
}

export class ContentNotFoundError extends ProgressTrackingError {
  constructor(contentType: string, contentId: string) {
    super(`${contentType} with id ${contentId} not found`);
    this.name = 'ContentNotFoundError';
  }
}

export class ValidationError extends ProgressTrackingError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends ProgressTrackingError {
  constructor(operation: string, error: unknown) {
    super(`Database error during ${operation}: ${error instanceof Error ? error.message : String(error)}`);
    this.name = 'DatabaseError';
  }
}

export class QueueError extends ProgressTrackingError {
  constructor(operation: string, error: unknown) {
    super(`Queue error during ${operation}: ${error instanceof Error ? error.message : String(error)}`);
    this.name = 'QueueError';
  }
}

export class ConcurrencyError extends ProgressTrackingError {
  constructor(message: string) {
    super(`Concurrency error: ${message}`);
    this.name = 'ConcurrencyError';
  }
} 