import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { gateway } from '@ai-sdk/gateway';

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model: gateway('deepseek/deepseek-v3.2-exp'),
    system: `You are MiDika's AI assistant. MiDika is an Italian software house focused on minimalism and design.
Be helpful, concise, and professional. You can answer questions about software development, design, and MiDika's services.
Keep responses brief and to the point.`,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
