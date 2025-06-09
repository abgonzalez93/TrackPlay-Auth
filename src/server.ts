import { createApp, startServer } from '@trackplay/core/server'
import { MiddlewareOptions } from '@trackplay/core/middlewares'
import { createLogger } from '@trackplay/core/logger'
import { getEnvConfig } from '@config/index'
import { routes } from '@routes/index'

const { NODE_ENV, HOST, PORT, CORS_ORIGINS } = getEnvConfig

const isDevelopment = NODE_ENV === 'development'

createLogger({
  isDevelopment: isDevelopment,
  label: 'TrackPlay-Auth',
  level: 'info',
})

const middlewares: MiddlewareOptions = {
  cors: {
    origin: CORS_ORIGINS.split(','),
    credentials: true,
  },
  errorHandler: {
    isDevelopment: isDevelopment,
  },
}

const app = createApp({
  routes,
  middlewares,
})

startServer(app, {
  protocol: isDevelopment ? 'http' : 'https',
  host: HOST,
  port: PORT,
})
