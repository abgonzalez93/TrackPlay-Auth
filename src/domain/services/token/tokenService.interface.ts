import { TokenGenerateInput, TokenPair } from '@trackplay/core/schemas'

/**
 * **TokenService (interface)**
 *
 * Defines the **application-level contract** for issuing cryptographically signed JWT tokens.
 *
 * This service operates purely on **domain-level DTOs**, abstracting away any
 * low-level cryptographic or signing logic (handled by the {@link TokenPort}).
 *
 * ### Responsibilities
 * - Generate short-lived **access tokens** for authentication.
 * - Generate long-lived **refresh tokens** for session renewal.
 * - Provide a unified method to issue both tokens consistently.
 *
 * ### Notes
 * - Operates at the **application layer**, coordinating token issuance
 *   without direct dependency on cryptographic libraries such as `jose`.
 * - Used internally by {@link TokenUseCase} for authentication workflows.
 */
export interface TokenService {
  /**
   * Generates a signed access token.
   *
   * @param payload - The {@link TokenGenerateInput} data to embed within the JWT (e.g. `sub`, `roles`).
   * @returns A Promise resolving to the signed **access token** string.
   */
  generateAccessToken(payload: TokenGenerateInput): Promise<string>

  /**
   * Generates a signed refresh token.
   *
   * @param payload - The {@link TokenGenerateInput} data used for the refresh token.
   * @returns A Promise resolving to the signed **refresh token** string.
   */
  generateRefreshToken(payload: TokenGenerateInput): Promise<string>

  /**
   * Generates a pair of access and refresh tokens in a single operation.
   *
   * @param payload - The {@link TokenGenerateInput} data to embed in both tokens.
   * @returns A Promise resolving to a {@link TokenPair} containing both signed tokens.
   */
  generateTokens(payload: TokenGenerateInput): Promise<TokenPair>
}
