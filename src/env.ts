import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_IUBENDA_PUBLIC_API_KEY: z.string().optional(),
  NEXT_PUBLIC_IUBENDA_PRIVACY_POLICY_ID: z.string().optional(),
  IUBENDA_PRIVATE_API_KEY: z.string().optional(),
  KV_REST_API_URL: z.string().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_IUBENDA_PUBLIC_API_KEY:
    process.env.NEXT_PUBLIC_IUBENDA_PUBLIC_API_KEY,
  NEXT_PUBLIC_IUBENDA_PRIVACY_POLICY_ID:
    process.env.NEXT_PUBLIC_IUBENDA_PRIVACY_POLICY_ID,
  IUBENDA_PRIVATE_API_KEY: process.env.IUBENDA_PRIVATE_API_KEY,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});
