import {
  NodeEnvSchema,
  IpAddressSchema,
  PortSchema,
  NonEmptyStringSchema,
  UrlStringSchema,
  PositiveNumberSchema,
} from '@trackplay/core/schemas'
import { createEnv } from '@t3-oss/env-core'

export const getEnvConfig = createEnv({
  server: {
    NODE_ENV: NodeEnvSchema,

    HOST: IpAddressSchema,
    PORT: PortSchema,
    CORS_ORIGINS: NonEmptyStringSchema,

    DATABASE_URL: UrlStringSchema,
    REDIS_URL: UrlStringSchema,

    ACCESS_TOKEN_TTL: PositiveNumberSchema.default(900),
    REFRESH_TOKEN_TTL: PositiveNumberSchema.default(604800),

    AUTH_SECRET_KEY: NonEmptyStringSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
