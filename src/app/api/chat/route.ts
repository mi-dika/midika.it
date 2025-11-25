import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are MiDika's AI assistant. MiDika (legally MIDIKA SRL) is an Italian software house based in Milan, focused on minimalism and design.

For questions about MiDika, MIDIKA SRL, the team, mission, philosophy, or contact information, base your answers on the official About page at https://midika.it/about. Key facts:
- Founded by Nicholas Sollazzo (CEO), Martire Baldassarre (CFO), and Domenico Magaretti (CSO)
- Core values: KISS, DRY, YAGNI, and TDD
- Core Service: Software Development
- Address: Via Giovanni Boccaccio 37, 20123 Milano (MI), Italy
- VAT: IT12042860960 | Phone: (+39) 351 989 6805 | Email: info@midika.it

You have access to tools that can fetch real-time company information. Use them when appropriate to provide accurate, up-to-date responses.

When relevant, include a link to https://midika.it/about for more details.

Be helpful, concise, and professional. Keep responses brief and to the point. Format responses using markdown for better readability - use **bold**, *italics*, lists, and code blocks where appropriate.`;

// Company information data
const COMPANY_INFO = {
  name: 'MiDika',
  legalName: 'MIDIKA SRL',
  founded: '2024',
  location: 'Milan, Italy',
  address: 'Via Giovanni Boccaccio 37, 20123 Milano (MI), Italy',
  vat: 'IT12042860960',
  phone: '(+39) 351 989 6805',
  email: 'info@midika.it',
  website: 'https://midika.it',
  team: [
    { name: 'Nicholas Sollazzo', role: 'CEO', focus: 'Vision & Technology' },
    { name: 'Martire Baldassarre', role: 'CFO', focus: 'Finance & Operations' },
    { name: 'Domenico Magaretti', role: 'CSO', focus: 'Strategy & Growth' },
  ],
  values: [
    {
      acronym: 'KISS',
      meaning: 'Keep It Simple Stupid',
      description: 'Simplicity over complexity',
    },
    {
      acronym: 'DRY',
      meaning: "Don't Repeat Yourself",
      description: 'Code reusability',
    },
    {
      acronym: 'YAGNI',
      meaning: "You Aren't Gonna Need It",
      description: 'Build what you need',
    },
    {
      acronym: 'TDD',
      meaning: 'Test Driven Development',
      description: 'Quality through testing',
    },
  ],
};

const SERVICES = [
  {
    name: 'Custom Software Development',
    description:
      'Tailored solutions built with modern technologies, following best practices and clean architecture.',
    technologies: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python'],
  },
  {
    name: 'Web Application Development',
    description:
      'Beautiful, performant web applications with focus on user experience and accessibility.',
    technologies: ['Next.js', 'Tailwind CSS', 'Vercel', 'PostgreSQL'],
  },
  {
    name: 'AI Integration',
    description:
      'Intelligent features powered by cutting-edge AI models, seamlessly integrated into your products.',
    technologies: ['OpenAI', 'Anthropic', 'Vercel AI SDK', 'LangChain'],
  },
  {
    name: 'Technical Consulting',
    description:
      'Expert guidance on architecture, technology choices, and engineering best practices.',
    areas: ['Architecture Review', 'Code Quality', 'Performance Optimization'],
  },
];

// Define tools
const tools = {
  getCompanyInfo: tool({
    description:
      'Get detailed information about MiDika including team members, contact details, and company values. Use this when users ask about the company, team, contact info, or values.',
    inputSchema: z.object({
      section: z
        .enum(['all', 'team', 'contact', 'values'])
        .optional()
        .describe('Specific section to retrieve'),
    }),
    execute: async ({ section = 'all' }) => {
      switch (section) {
        case 'team':
          return `## MiDika Team\n\n${COMPANY_INFO.team.map((m) => `- **${m.name}** - ${m.role} (${m.focus})`).join('\n')}`;
        case 'contact':
          return `## Contact MiDika\n\n- **Email:** ${COMPANY_INFO.email}\n- **Phone:** ${COMPANY_INFO.phone}\n- **Address:** ${COMPANY_INFO.address}\n- **Website:** ${COMPANY_INFO.website}`;
        case 'values':
          return `## Our Core Values\n\n${COMPANY_INFO.values.map((v) => `- **${v.acronym}** (${v.meaning}): ${v.description}`).join('\n')}`;
        default:
          return JSON.stringify(COMPANY_INFO, null, 2);
      }
    },
  }),
  getServices: tool({
    description:
      'Get information about services offered by MiDika. Use this when users ask about what MiDika does, services, or capabilities.',
    inputSchema: z.object({}),
    execute: async () => {
      return `## Our Services\n\n${SERVICES.map((s) => {
        const items: string[] =
          'technologies' in s && s.technologies
            ? s.technologies
            : 'areas' in s && s.areas
              ? s.areas
              : [];
        return `### ${s.name}\n${s.description}\n\n**Technologies:** ${items.join(', ')}`;
      }).join('\n\n')}`;
    },
  }),
  getCurrentTime: tool({
    description:
      'Get the current date and time in Milan, Italy (MiDika headquarters). Use this to demonstrate real-time capabilities or when users ask about time.',
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();
      const milanTime = now.toLocaleString('en-US', {
        timeZone: 'Europe/Rome',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return `Current time in Milan: **${milanTime}**`;
    },
  }),
};

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model: gateway('deepseek/deepseek-v3.2-exp'),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(3), // Allow tool use with follow-up
  });

  return result.toUIMessageStreamResponse();
}
