import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const getEnvConfig = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    HOST: z.string().ip().or(z.literal('localhost')),
    PORT: z.coerce.number(),
    CORS_ORIGINS: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
