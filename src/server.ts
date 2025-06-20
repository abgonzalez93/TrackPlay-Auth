import { createApp, startServer } from '@trackplay/core/server'
import { createLogger } from '@trackplay/core/logger'
import { getEnvConfig } from '@config/index'
import { startRedis } from '@services/index'
import { routes } from '@routes/index'

const { NODE_ENV, HOST, PORT, CORS_ORIGINS } = getEnvConfig

const isDevelopment = NODE_ENV === 'development'

createLogger({
  isDevelopment: isDevelopment,
  label: 'TrackPlay-Auth',
  level: 'info',
})

await startRedis()

const app = createApp({
  routes,
  middlewares: {
    cors: {
      origin: CORS_ORIGINS.split(','),
      credentials: true,
    },
    errorHandler: {
      isDevelopment: isDevelopment,
    },
  },
})

startServer(app, {
  protocol: isDevelopment ? 'http' : 'https',
  host: HOST,
  port: PORT,
})
