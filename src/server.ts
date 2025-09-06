import { createApp, startServer } from '@trackplay/core/server'
import { createI18n, initI18n } from '@trackplay/core/i18n'
import { connectRedis } from '@trackplay/core/clients'
import { createLogger } from '@trackplay/core/logger'
import { getEnvConfig } from '@config/index'
import { routes } from '@routes/index'
import { redis } from '@clients/index'

const { NODE_ENV, HOST, PORT, CORS_ORIGINS } = getEnvConfig

const isDevelopment = NODE_ENV === 'development'
const corsOrigins = CORS_ORIGINS.split(',')

/**
 * Bootstraps the TrackPlay Auth service.
 *
 * This function is responsible for:
 * - Initializing internationalization (i18n).
 * - Creating and configuring the logger.
 * - Establishing a connection with Redis.
 * - Creating the Express application with routes and middlewares.
 * - Starting the HTTP/HTTPS server.
 *
 * @throws Will terminate the process if the server fails to start.
 */
const bootstrap = async () => {
  const logger = createLogger({
    isDevelopment: isDevelopment,
    label: 'TrackPlay-Auth',
    level: 'info',
  })

  await connectRedis(redis, logger)

  const i18n = createI18n()
  await initI18n(i18n)

  const app = createApp({
    routes,
    middlewareOptions: {
      cors: {
        origin: corsOrigins,
        credentials: true,
      },
      errorHandler: {
        isDevelopment: isDevelopment,
      },
    },
    i18n,
    logger,
  })

  startServer(app, logger, {
    protocol: isDevelopment ? 'http' : 'https',
    host: HOST,
    port: PORT,
  })
}

await bootstrap().catch((error) => {
  console.error('❌ Failed to start server', error)
  process.exit(1)
})
