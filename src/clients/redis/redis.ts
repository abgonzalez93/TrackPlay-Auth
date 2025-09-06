import { createRedis } from '@trackplay/core/clients'
import { getEnvConfig } from '@config/index'

const { REDIS_URL } = getEnvConfig

/**
 * Redis client instance used to interact with the Redis server. *
 * This client is created using the createRedis factory function, *
 * which allows passing the Redis server URL dynamically (e.g., from environment variables). *
 * @see createRedis - Factory function to create a Redis client instance with the specified URL.
 **/

export const redis = createRedis(REDIS_URL)
