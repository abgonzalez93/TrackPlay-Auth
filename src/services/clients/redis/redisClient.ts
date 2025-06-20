import { getEnvConfig } from '@config/index'
import { createClient } from 'redis'

const { REDIS_URL } = getEnvConfig

/**
 * Redis client instance configured with the application's REDIS_URL.
 *
 * This client is used to interact with the Redis server for operations such as
 * token revocation, caching, rate limiting, or any other feature that relies on Redis.
 *
 * @see startRedis - Use `startRedis()` to establish the connection during app bootstrap.
 */
export const redisClient = createClient({ url: REDIS_URL })
