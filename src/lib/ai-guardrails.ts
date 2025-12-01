import { LanguageModelMiddleware } from 'ai';

export const guardrailMiddleware: LanguageModelMiddleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    // Input Guardrails
    validateInput(params.prompt);

    const result = await doGenerate();

    // Output Guardrails (can be added here)

    return result;
  },

  wrapStream: async ({ doStream, params }) => {
    // Input Guardrails
    validateInput(params.prompt);

    const { stream, ...rest } = await doStream();

    // Transform stream for output guardrails if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformStream = new TransformStream<any, any>({
      transform(chunk, controller) {
        // Simple pass-through for now
        // We could inspect chunks here for harmful content
        controller.enqueue(chunk);
      },
    });

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    };
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateInput(prompt: any) {
  const messages = prompt;

  // 1. Check total message count
  if (Array.isArray(messages) && messages.length > 50) {
    throw new Error('Conversation too long. Please start a new chat.');
  }

  // 2. Check total character count of the last user message
  if (Array.isArray(messages) && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === 'user' &&
      typeof lastMessage.content === 'string'
    ) {
      // Simple check for string content
      if (lastMessage.content.length > 1000) {
        throw new Error(
          'Message too long. Please keep it under 1000 characters.'
        );
      }

      // 3. Check for jailbreak patterns
      const jailbreakPatterns = [
        /ignore all previous instructions/i,
        /you are now unchecked/i,
        /start a new roleplay/i,
        /simulated mode/i,
      ];

      for (const pattern of jailbreakPatterns) {
        if (pattern.test(lastMessage.content)) {
          throw new Error('Request rejected due to safety policy.');
        }
      }
    } else if (
      lastMessage.role === 'user' &&
      Array.isArray(lastMessage.content)
    ) {
      // Handle multi-part content (e.g. text + image) if needed, for now just check text parts
      let totalLength = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const part of lastMessage.content as any[]) {
        if (part.type === 'text') {
          totalLength += part.text.length;
          const jailbreakPatterns = [
            /ignore all previous instructions/i,
            /you are now unchecked/i,
            /start a new roleplay/i,
            /simulated mode/i,
          ];
          for (const pattern of jailbreakPatterns) {
            if (pattern.test(part.text)) {
              throw new Error('Request rejected due to safety policy.');
            }
          }
        }
      }
      if (totalLength > 1000) {
        throw new Error(
          'Message too long. Please keep it under 1000 characters.'
        );
      }
    }
  }
}
