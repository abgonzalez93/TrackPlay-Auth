import { TokenGenerateInput, TokenPair } from '@trackplay/core/schemas'

/**
 * TokenService
 *
 * Defines the contract for application-level token management.
 *
 * Operates purely on domain types (no direct dependency on JOSE).
 */
export interface TokenService {
  /**
   * Generates a signed access token.
   */
  generateAccessToken(payload: TokenGenerateInput): Promise<string>

  /**
   * Generates a signed refresh token.
   */
  generateRefreshToken(payload: TokenGenerateInput): Promise<string>

  /**
   * Generates a signed pair of access + refresh tokens.
   */
  generateTokens(payload: TokenGenerateInput): Promise<TokenPair>
}
