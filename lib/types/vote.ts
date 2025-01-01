export interface Vote {
  id: string;
  messageId: string;
  userId: string;
  chatId: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
} 