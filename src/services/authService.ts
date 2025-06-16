import { blacklistService, tokenService } from '@services/index'
import { UnauthorizedError } from '@trackplay/core/errors'
import { TokenPair } from '@trackplay/core/schemas'

/**
 * Service responsible for handling authentication operations within the Auth microservice.
 * This service is only responsible for credential verification and token signing.
 * It does not validate incoming tokens — that responsibility lies with the backend.
 */
export const authService = {
  /**
   * Issues a new pair of access and refresh tokens for a given user ID.
   * The user ID must already have been validated externally (e.g., via a valid refresh token).
   *
   * @param sub - The user ID to include in the token payload
   * @returns An object containing signed access and refresh tokens
   */
  generateTokens: async (sub: string): Promise<TokenPair> => {
    return tokenService.generateTokens(sub)
  },

  /**
   * Revokes a refresh token by blacklisting its `jti` in Redis.
   *
   * @param jti - The unique identifier of the refresh token (from payload)
   * @param exp - The expiration timestamp of the token (in seconds)
   * @returns A Promise that resolves when the token is blacklisted
   */
  revokeRefreshToken: async (jti: string, exp: number): Promise<void> => {
    const ttl = exp - Math.floor(Date.now() / 1000)
    if (ttl <= 0) throw new UnauthorizedError('Token has already expired')
    await blacklistService.revokeToken(jti, ttl)
  },

  /**
   * Checks whether a given refresh token has been revoked.
   *
   * @param jti - The JWT ID of the refresh token to check
   * @returns A boolean indicating whether the token is revoked
   */
  isRefreshTokenRevoked: async (jti: string): Promise<boolean> => {
    return blacklistService.isTokenRevoked(jti)
  },

  /**
   * Rotates a refresh token by:
   * 1. Checking if the current refresh token has been revoked.
   * 2. Revoking the current refresh token.
   * 3. Issuing a new access and refresh token pair.
   *
   * @param sub - The user ID of refresh token
   * @param jti - The JWT ID of the refresh token
   * @param exp - The expiration time (in seconds since epoch)
   * @returns An object containing a new pair of access and refresh tokens
   * @throws If the refresh token has already been revoked
   */
  rotateTokens: async (sub: string, jti: string, exp: number): Promise<TokenPair> => {
    const isRevoked = await authService.isRefreshTokenRevoked(jti)
    if (isRevoked) throw new UnauthorizedError('Refresh token has been revoked')
    await authService.revokeRefreshToken(jti, exp)
    return await authService.generateTokens(sub)
  },
}
