import {
  TokenGenerateInput,
  TokenRevokeInput,
  TokenRevocationStatusInput,
  TokenRotateInput,
  TokenPair,
} from '@trackplay/core/schemas'

/**
 * **TokenUseCase (interface)**
 *
 * Defines the **application-level contract** for managing the JWT lifecycle.
 * Declares the high-level operations available for issuing, revoking,
 * and rotating tokens — without exposing cryptographic or persistence details.
 *
 * ---
 * ### Responsibilities
 * - Provide a unified API for generating, revoking, and rotating JWT tokens.
 * - Operate solely on **domain-level DTOs** (e.g., {@link TokenGenerateInput}, {@link TokenPair}).
 * - Remain agnostic of low-level signing or storage mechanisms.
 *
 * ---
 * ### Notes
 * - Implementations typically coordinate between {@link TokenService}
 *   (for token issuance) and {@link BlacklistService} (for revocation logic).
 * - This interface defines *what* the application can do, not *how* it does it.
 * - Intended for use cases that enforce token integrity and rotation safety.
 */
export interface TokenUseCase {
  /**
   * **Generate Tokens**
   *
   * Issues a new signed **access + refresh token pair** for the provided subject.
   *
   * @param payload - The {@link TokenGenerateInput} containing token claims (e.g., `sub`).
   * @returns A {@link TokenPair} containing the issued tokens.
   */
  generateTokens(payload: TokenGenerateInput): Promise<TokenPair>

  /**
   * **Revoke Refresh Token**
   *
   * Blacklists a refresh token’s JTI until its expiration.
   * Ensures that once revoked, it cannot be reused (e.g., after logout or rotation).
   *
   * @param payload - The {@link TokenRevokeInput} containing `jti` and `exp`.
   * @returns A promise resolving when the token is successfully revoked.
   */
  revokeRefreshToken(payload: TokenRevokeInput): Promise<void>

  /**
   * **Check Revocation Status**
   *
   * Verifies whether a given token (by JTI) is already blacklisted.
   *
   * @param payload - The {@link TokenRevocationStatusInput} containing the token’s `jti`.
   * @returns `true` if revoked; otherwise `false`.
   */
  isRefreshTokenRevoked(payload: TokenRevocationStatusInput): Promise<boolean>

  /**
   * **Rotate Tokens**
   *
   * Performs a secure rotation of refresh tokens while enforcing single-use.
   * Revokes the old token before issuing a new {@link TokenPair}.
   *
   * @param payload - The {@link TokenRotateInput} containing `sub`, `exp`, and `jti`.
   * @returns A new {@link TokenPair} representing the rotated tokens.
   */
  rotateTokens(payload: TokenRotateInput): Promise<TokenPair>
}
