import { createApp, startServer } from '@trackplay/core/server'
import { MiddlewareOptions } from '@trackplay/core/middlewares'
import { createLogger } from '@trackplay/core/logger'
import { getConf } from '@config/index'
import { routes } from '@routes/index'

const { IS_DEVELOPMENT, HOST, PORT, CORS_ORIGINS } = getConf()

createLogger({
  isDevelopment: IS_DEVELOPMENT,
  label: 'TrackPlay-Auth',
  level: 'info',
})

const middlewares: MiddlewareOptions = {
  cors: {
    origin: CORS_ORIGINS.split(','),
    credentials: true,
  },
  errorHandler: {
    isDevelopment: IS_DEVELOPMENT,
  },
}

const app = createApp({
  routes,
  middlewares,
})

startServer(app, {
  protocol: IS_DEVELOPMENT ? 'http' : 'https',
  host: HOST,
  port: PORT,
})
