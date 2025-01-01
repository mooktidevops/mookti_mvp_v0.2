import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { EnhancedChat } from '@/components/custom/enhanced-chat';
import { getChatById, getMessagesByChatId } from '@/db/queries';
import { DEFAULT_MODEL_NAME, models } from '@/helpers/ai/models';
import { auth } from '@/lib/auth';
import { getInitialContentChunk } from '@/lib/content/getInitialContentChunk';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const [messagesFromDb, initialContentChunk] = await Promise.all([
    getMessagesByChatId({ id }),
    getInitialContentChunk()
  ]);

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  console.log('Rendering EnhancedChat with:', {
    id: chat.id,
    messagesCount: messagesFromDb.length,
    selectedModelId,
    hasInitialChunk: !!initialContentChunk
  });

  // If there are no messages, we'll use the initial content chunk
  const initialMessages = messagesFromDb.length > 0 
    ? convertToUIMessages(messagesFromDb)
    : initialContentChunk 
      ? [{ 
          id: chat.id, 
          role: 'system' as const, 
          content: initialContentChunk.content 
        }]
      : [];

  return (
    <EnhancedChat
      id={chat.id}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
      initialChunk={initialContentChunk}
    />
  );
}
