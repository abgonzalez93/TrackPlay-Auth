import { BlacklistPort } from '@trackplay/core/ports'
import { RedisClientType } from 'redis'

const BLACKLIST_PREFIX = 'blacklist:token:'

/**
 * **Redis Blacklist Adapter**
 *
 * Infrastructure-level adapter implementing the {@link BlacklistPort}
 * using **Redis** as the underlying storage mechanism.
 *
 * This adapter defines **how** JWT revocations are persisted and checked
 * at runtime by storing token JTIs as keys with an expiration time.
 *
 * ### Responsibilities
 * - Persist revoked tokens using their unique JTI identifiers.
 * - Automatically expire blacklisted tokens based on TTL.
 * - Query Redis to verify revocation status efficiently.
 *
 * ### Notes
 * - Each revoked token is stored under the key pattern `blacklist:token:{jti}`.
 * - Redis automatically deletes entries after their TTL (token expiration).
 * - Designed for **horizontal scalability** — shared across multiple instances.
 * - Used by {@link BlacklistService} to enforce one-time refresh token usage.
 *
 * @param redis - Initialized {@link RedisClientType} instance connected to the Redis server.
 * @returns A {@link BlacklistPort} implementation backed by Redis.
 *
 * @see {@link BlacklistPort}
 * @see {@link BlacklistService}
 * @see {@link TokenUseCase}
 */
export const redisBlacklistAdapter = (redis: RedisClientType): BlacklistPort => {
  /**
   * **Revoke Token**
   *
   * Stores a token’s unique identifier (`jti`) in Redis to mark it as revoked.
   * The key will expire automatically after the provided TTL (in seconds),
   * ensuring the blacklist entry is removed once the token would have expired.
   *
   * ### Flow
   * 1. Construct a namespaced key using the prefix `blacklist:token:{jti}`.
   * 2. Store the key in Redis with the value `"revoked"`.
   * 3. Set the expiration time based on the token’s remaining lifetime.
   *
   * @param jti - Unique JWT identifier (`jti` claim) of the token to blacklist.
   * @param ttlSeconds - Time-to-live (in seconds) until the key expires.
   * @returns Resolves when the revocation entry is successfully persisted.
   */
  const revokeToken = async (jti: string, ttlSeconds: number): Promise<void> => {
    const key = `${BLACKLIST_PREFIX}${jti}`
    await redis.set(key, 'revoked', {
      expiration: {
        type: 'EX',
        value: ttlSeconds,
      },
    })
  }

  /**
   * **Check Revocation Status**
   *
   * Verifies whether a given token identifier (`jti`) is present in the Redis blacklist.
   *
   * ### Flow
   * 1. Construct the Redis key using the token JTI.
   * 2. Query Redis for key existence via `EXISTS`.
   * 3. Return `true` if the key exists (token revoked), otherwise `false`.
   *
   * @param jti - Unique JWT identifier (`jti` claim) of the token to verify.
   * @returns `true` if the token has been revoked, otherwise `false`.
   *
   * @remarks
   * Used by {@link TokenUseCase} to validate refresh token reusability.
   */
  const isTokenRevoked = async (jti: string): Promise<boolean> => {
    const key = `${BLACKLIST_PREFIX}${jti}`
    const exists = await redis.exists(key)
    return exists === 1
  }

  return {
    revokeToken,
    isTokenRevoked,
  }
}
