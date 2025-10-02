import { connectRedis } from '@trackplay/core/clients'
import { bootstrap } from '@trackplay/core/server'
import { getEnvConfig } from '@config/index'
import { routes } from '@routes/index'
import { redis } from '@clients/index'

/**
 * **TrackPlay Auth — Service Entry Point**
 *
 * Initializes and launches the **TrackPlay-Auth** microservice.
 *
 * This file serves as the composition root for the authentication service,
 * delegating its initialization to the shared {@link bootstrap} utility
 * provided by `@trackplay/core/server`. It ensures consistent startup behavior
 * and lifecycle management across all TrackPlay microservices.
 *
 * ### Responsibilities
 * - Load and validate environment configuration via {@link getEnvConfig}.
 * - Establish a Redis connection before starting the HTTP server using {@link connectRedis}.
 * - Register all service-specific routes defined in {@link routes}.
 * - Initialize the shared infrastructure stack (logging, i18n, middlewares).
 * - Start the server under the service name **"TrackPlay-Auth"** for centralized logging and observability.
 *
 * ### Notes
 * - The {@link onBeforeApp} lifecycle hook ensures critical dependencies
 *   (like Redis) are ready before Express starts listening.
 * - Uses the shared {@link bootstrap} helper to maintain consistency
 *   with other services such as Catalog, IGDB, and Notifications.
 * - This file should remain minimal — all setup logic must be delegated
 *   to the reusable core infrastructure utilities.
 *
 * @see {@link bootstrap}
 * @see {@link connectRedis}
 * @see {@link getEnvConfig}
 * @see {@link routes}
 */
await bootstrap({
  serviceName: 'TrackPlay-Auth',
  routes,
  env: getEnvConfig,
  onBeforeApp: async (logger) => await connectRedis(redis, logger),
})
