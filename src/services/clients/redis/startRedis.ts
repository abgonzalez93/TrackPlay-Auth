import { getLogger } from '@trackplay/core/logger'
import { redisClient } from './redisClient'

/**
 * Starts and connects the Redis client using the configured REDIS_URL.
 *
 * This function must be invoked during the application bootstrap phase to ensure
 * Redis is available for any dependent services (e.g., token blacklist, caching).
 * If the connection fails, the application will log the error and exit with code 1.
 *
 * It also registers a global error handler to log any Redis runtime errors.
 *
 * @throws Will terminate the process if the Redis connection fails.
 */
export const startRedis = async (): Promise<void> => {
  const log = getLogger()

  redisClient.on('error', (error) => {
    log.error('❌ Redis client error:', error)
  })

  try {
    await redisClient.connect()
    log.info('✅ Redis connected')
  } catch (error) {
    log.error('❌ Failed to connect to Redis:', error)
    process.exit(1)
  }
}
