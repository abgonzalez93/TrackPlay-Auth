import { createRedis } from '@trackplay/core/clients'
import { getEnvConfig } from '@config/index'

const { REDIS_URL } = getEnvConfig

/**
 * **Redis Client Instance**
 *
 * Provides a preconfigured Redis client connected to the server
 * defined by the `REDIS_URL` environment variable.
 *
 * This instance is created via the {@link createRedis} factory,
 * ensuring consistent initialization across services.
 *
 * ### Responsibilities
 * - Expose a ready-to-use Redis client for caching, blacklisting, and other persistence operations.
 * - Centralize Redis configuration to maintain consistency across environments.
 *
 * ### Notes
 * - The connection itself is established later via {@link connectRedis},
 *   typically during the service bootstrap phase.
 * - Fails fast if `REDIS_URL` is missing or invalid.
 *
 * @see {@link createRedis} - Factory function for creating Redis clients.
 * @see {@link connectRedis} - Helper for connecting and validating Redis connectivity.
 */
export const redis = createRedis(REDIS_URL)
