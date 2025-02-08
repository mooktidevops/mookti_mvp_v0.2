import { cookies } from 'next/headers';
import ChatInterface from '@/components/new-ui/chat-interface';
import { DEFAULT_MODEL_NAME, models } from '@/helpers/ai/models';
import { getInitialContentChunk } from '@/lib/content/getInitialContentChunk';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  // Fetch the initial content chunk
  const initialContentChunk = await getInitialContentChunk();

  console.log("Initial content chunk in page.tsx:", initialContentChunk);

  // Convert the content chunk to a message format using 'type' instead of 'role'
  const initialMessages = initialContentChunk
    ? [
        {
          id: generateUUID(),
          type: 'system' as "system",
          content: initialContentChunk.content,
        },
      ]
    : [];

  return (
    <ChatInterface
      key={id}
      id={id}
      initialMessages={initialMessages}
      selectedModelId={selectedModelId}
      initialChunk={initialContentChunk}
    />
  );
}