import { TokenGenerateInput, TokenPair } from '@trackplay/core/schemas'
import { TokenService } from './tokenService.interface'
import { TokenPort } from '@trackplay/core/ports'

/**
 * **Token Service**
 *
 * Application-level service responsible for orchestrating **JWT issuance**.
 *
 * This service defines **how** tokens are generated within the application
 * layer while delegating the actual cryptographic signing to the underlying
 * {@link TokenPort}. It ensures a consistent interface for issuing both
 * access and refresh tokens, and consolidates pair creation logic.
 *
 * ### Responsibilities
 * - Generate signed access and refresh tokens via the {@link TokenPort}.
 * - Issue token pairs (`access + refresh`) in a consistent and atomic manner.
 * - Serve as the bridge between use cases and cryptographic adapters.
 *
 * ### Notes
 * - Operates purely at the **application layer** — contains no JWT signing logic.
 * - The {@link TokenPort} handles low-level cryptographic operations.
 * - Used primarily by {@link TokenUseCase} during login and refresh flows.
 *
 * @param tokenPort - The {@link TokenPort} responsible for token signing.
 * @returns A {@link TokenService} exposing methods for issuing JWTs.
 *
 * @see {@link TokenUseCase}
 * @see {@link TokenPort}
 * @see {@link TokenPair}
 */
export const tokenService = (tokenPort: TokenPort): TokenService => {
  /**
   * **Generate Access Token**
   *
   * Issues a new **access token** containing the subject identifier (`sub`).
   *
   * ### Flow
   * 1. Delegates to {@link TokenPort.generateAccessToken}.
   * 2. Signs a token scoped for short-term use (e.g., 15 minutes).
   *
   * @param payload - The {@link TokenGenerateInput} containing the token subject.
   * @returns A signed access token string.
   */
  const generateAccessToken = async (payload: TokenGenerateInput): Promise<string> => {
    return tokenPort.generateAccessToken({ sub: payload.sub })
  }

  /**
   * **Generate Refresh Token**
   *
   * Issues a new **refresh token** for long-term authentication renewal.
   *
   * ### Flow
   * 1. Delegates to {@link TokenPort.generateRefreshToken}.
   * 2. Signs a token with extended lifetime (e.g., 1 day or 7 days).
   *
   * @param payload - The {@link TokenGenerateInput} containing the token subject.
   * @returns A signed refresh token string.
   */
  const generateRefreshToken = async (payload: TokenGenerateInput): Promise<string> => {
    return tokenPort.generateRefreshToken({ sub: payload.sub })
  }

  /**
   * **Generate Token Pair**
   *
   * Issues a synchronized **access + refresh token pair**.
   * This ensures consistency across authentication flows and avoids mismatch
   * between access and refresh lifecycles.
   *
   * ### Flow
   * 1. Calls {@link generateAccessToken} and {@link generateRefreshToken} in parallel.
   * 2. Returns both tokens as a unified {@link TokenPair}.
   *
   * @param payload - The {@link TokenGenerateInput} containing the subject ID.
   * @returns A {@link TokenPair} object with `accessToken` and `refreshToken`.
   */
  const generateTokens = async (payload: TokenGenerateInput): Promise<TokenPair> => {
    const [accessToken, refreshToken] = await Promise.all([generateAccessToken(payload), generateRefreshToken(payload)])
    return { accessToken, refreshToken }
  }

  return {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
  }
}
