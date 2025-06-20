import { redisClient } from '@services/index'

const BLACKLIST_PREFIX = 'blacklist:token:'

/**
 * Service for managing JWT refresh token revocation via Redis.
 *
 * Blacklisted tokens are stored using their unique `jti` as keys with an expiration time.
 * This ensures tokens cannot be reused after logout or rotation.
 *
 * @see revokeToken
 * @see isTokenRevoked
 */
export const blacklistService = {
  /**
   * Adds a token's `jti` to the Redis blacklist, preventing future use.
   *
   * The key will expire automatically after the token's original TTL.
   *
   * @param jti - The unique identifier of the token (JWT ID)
   * @param ttlSeconds - Time to live in seconds (e.g., token's exp - now)
   * @returns A Promise that resolves when the operation is complete
   *
   * @example
   * await blacklistService.revokeToken('abc-123', 604800) // 7 days
   */
  revokeToken: async (jti: string, ttlSeconds: number): Promise<void> => {
    const key = `${BLACKLIST_PREFIX}${jti}`
    await redisClient.set(key, 'revoked', {
      expiration: {
        type: 'EX',
        value: ttlSeconds,
      },
    })
  },

  /**
   * Checks if the given `jti` exists in the Redis blacklist.
   *
   * This is used to verify whether a refresh token has been revoked.
   *
   * @param jti - The unique JWT ID to check
   * @returns A boolean indicating whether the token has been revoked
   *
   * @example
   * const isRevoked = await blacklistService.isTokenRevoked('abc-123')
   */
  isTokenRevoked: async (jti: string): Promise<boolean> => {
    const key = `${BLACKLIST_PREFIX}${jti}`
    const result = await redisClient.exists(key)
    return result === 1
  },
}
