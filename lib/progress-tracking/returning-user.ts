import { getLastAccessedContent } from './last-accessed';
import { type LastAccessedContent } from './types';

export interface ReturningUserContext {
  lastContent: LastAccessedContent;
  suggestedAction: 'continue' | 'start_new';
  continuationPrompt: string;
}

export async function generateReturningUserScript(userId: string): Promise<ReturningUserContext> {
  const lastContent = await getLastAccessedContent(userId);

  if (!lastContent.chunk) {
    return {
      lastContent,
      suggestedAction: 'start_new',
      continuationPrompt: "Welcome back! Would you like to start your learning journey?"
    };
  }

  // Build context-aware continuation prompt
  let continuationPrompt = "Welcome back! ";

  if (lastContent.learningPath) {
    const { completedSequences, totalSequences } = lastContent.learningPath;
    continuationPrompt += `You're ${Math.round((completedSequences / totalSequences) * 100)}% through the "${lastContent.learningPath.title}" learning path. `;
  }

  if (lastContent.sequence) {
    const { completedModules, totalModules } = lastContent.sequence;
    continuationPrompt += `In the current sequence, you've completed ${completedModules} out of ${totalModules} modules. `;
  }

  if (lastContent.module) {
    const { completedChunks, totalChunks } = lastContent.module;
    continuationPrompt += `In your current module, you've completed ${completedChunks} out of ${totalChunks} content chunks. `;
  }

  // Determine if user is making good progress or might need a fresh start
  const isActivelyProgressing = lastContent.module && 
    (lastContent.module.lastAccessedAt && 
     new Date().getTime() - new Date(lastContent.module.lastAccessedAt).getTime() < 7 * 24 * 60 * 60 * 1000);

  const suggestedAction = isActivelyProgressing ? 'continue' : 'start_new';

  if (isActivelyProgressing) {
    continuationPrompt += "Would you like to continue where you left off?";
  } else {
    continuationPrompt += "It's been a while. Would you like to continue where you left off or start something new?";
  }

  return {
    lastContent,
    suggestedAction,
    continuationPrompt
  };
} 