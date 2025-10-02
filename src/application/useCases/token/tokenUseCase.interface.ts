import {
  TokenGenerateInput,
  TokenRevokeInput,
  TokenRevocationStatusInput,
  TokenRotateInput,
  TokenPair,
} from '@trackplay/core/schemas'

/**
 * TokenUseCase
 *
 * Defines the high-level business logic for token lifecycle management.
 * Operates entirely on domain-level DTOs (no dependency on JOSE or JWT internals).
 */
export interface TokenUseCase {
  /**
   * Generates a new access + refresh token pair.
   */
  generateTokens(payload: TokenGenerateInput): Promise<TokenPair>

  /**
   * Revokes a refresh token by adding its JTI to the blacklist.
   */
  revokeRefreshToken(payload: TokenRevokeInput): Promise<void>

  /**
   * Checks whether a given token has been revoked.
   */
  isRefreshTokenRevoked(payload: TokenRevocationStatusInput): Promise<boolean>

  /**
   * Rotates a refresh token (single-use enforcement).
   */
  rotateTokens(payload: TokenRotateInput): Promise<TokenPair>
}
