import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

import { models, DEFAULT_MODEL_NAME } from '@/ai/models';
import { regularPrompt } from '@/ai/prompts';

const defaultModel = models.find((m) => m.id === DEFAULT_MODEL_NAME);
if (!defaultModel) {
  throw new Error(`Default model ${DEFAULT_MODEL_NAME} not found in models config`);
}

export async function POST(req: Request) {
  try {
    const { history } = await req.json() as { history: string[] };

    const constructedPrompt = `
${regularPrompt}

You have just given your student the following information:
${history.join('\n')}

They've now asked you to explain this information further. Offer additional clarification, then ask whether they have any follow-up questions, or if you can do anything else to help.
    `.trim();

    // Since we've already thrown an error if defaultModel is undefined,
    // TypeScript should know it's defined. But to be extra clear:
    const defaultModel = models.find((m) => m.id === DEFAULT_MODEL_NAME);
    if (!defaultModel) {
      throw new Error(`Default model ${DEFAULT_MODEL_NAME} not found in models config`);
    } else {
      const { text } = await generateText({
        model: openai(defaultModel.apiIdentifier),
        prompt: constructedPrompt,
      });

      const answer = text?.trim() || "I'm sorry, I have no additional details to offer.";
      return NextResponse.json({ answer });
    }
  }
   catch (error) {
    console.error('Error in tellMeMore API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}