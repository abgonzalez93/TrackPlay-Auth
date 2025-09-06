import {
  TokenGenerationInput,
  RefreshTokenRevokeInput,
  RefreshTokenRevocationCheck,
  RefreshTokenRotationInput,
  SignedTokenPair,
} from '@trackplay/core/schemas'
import { blacklistService, tokenService } from '@services/index'
import { UnauthorizedError } from '@trackplay/core/errors'

/**
 * Service responsible for handling authentication operations within the Auth microservice.
 *
 * This service is in charge of issuing and revoking JWT tokens.
 * It does **not** validate incoming tokens — that responsibility lies with the backend.
 */
export const authService = {
  /**
   * Issues a new pair of access and refresh tokens for a given user ID.
   *
   * The user ID must already be validated (e.g., through credentials or a valid refresh token).
   *
   * @param payload - Object containing the user ID (`sub`) for which to issue tokens
   * @returns A signed access and refresh token pair
   */
  generateTokens: async (payload: TokenGenerationInput): Promise<SignedTokenPair> => {
    return tokenService.generateTokens(payload)
  },

  /**
   * Revokes a refresh token by storing its `jti` in the blacklist (e.g., Redis) until expiration.
   *
   * This prevents further reuse of the token, enforcing single-use semantics for refresh tokens.
   *
   * @param payload - Object containing the token's `jti` and its `exp` (expiration timestamp in seconds)
   * @throws {UnauthorizedError} If the token has already expired
   */
  revokeRefreshToken: async (payload: RefreshTokenRevokeInput): Promise<void> => {
    const { jti, exp } = payload
    const ttl = exp - Math.floor(Date.now() / 1000)
    if (ttl <= 0) throw new UnauthorizedError('auth.services.authService.expired_refresh')
    await blacklistService.revokeToken(jti, ttl)
  },

  /**
   * Checks whether a given refresh token has been revoked (i.e., is in the blacklist).
   *
   * This is useful for detecting token reuse or logout events.
   *
   * @param payload - Object containing the `jti` of the token to check
   * @returns `true` if the token is revoked, otherwise `false`
   */
  isRefreshTokenRevoked: async (payload: RefreshTokenRevocationCheck): Promise<boolean> => {
    const { jti } = payload
    return blacklistService.isTokenRevoked(jti)
  },

  /**
   * Rotates a refresh token by:
   * 1. Verifying that it has not been revoked
   * 2. Revoking it to prevent reuse
   * 3. Issuing a new pair of tokens
   *
   * This process ensures that refresh tokens are single-use and enforces session integrity.
   *
   * @param payload - Object containing `sub` (user ID), `jti`, and `exp` of the current token
   * @returns A newly signed access and refresh token pair
   * @throws {UnauthorizedError} If the token has already been revoked
   */
  rotateTokens: async (payload: RefreshTokenRotationInput): Promise<SignedTokenPair> => {
    const { jti, exp, sub } = payload
    const isRevoked = await authService.isRefreshTokenRevoked({ jti })
    if (isRevoked) throw new UnauthorizedError('auth.services.authService.revoked_refresh')
    await authService.revokeRefreshToken({ jti, exp })
    return await authService.generateTokens({ sub })
  },
}
