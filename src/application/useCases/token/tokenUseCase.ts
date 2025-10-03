import {
  TokenGenerateInput,
  TokenRevokeInput,
  TokenRotateInput,
  TokenRevocationStatusInput,
  TokenPair,
} from '@trackplay/core/schemas'
import { TokenService, BlacklistService } from '@services/index'
import { getTranslationPath } from '@trackplay/core/utils'
import { UnauthorizedError } from '@trackplay/core/errors'
import { TokenUseCase } from './tokenUseCase.interface'

const path = getTranslationPath(import.meta.url)

/**
 * **Token Use Case**
 *
 * Application-level orchestrator managing the complete **JWT lifecycle** —
 * including generation, validation, rotation, and revocation.
 *
 * This use case coordinates the {@link TokenService} (responsible for signing tokens)
 * and the {@link BlacklistService} (responsible for enforcing single-use refresh behavior).
 *
 * ---
 * ### Responsibilities
 * - Issue new **access** and **refresh** token pairs.
 * - Revoke refresh tokens by blacklisting their JTI identifiers.
 * - Verify whether a refresh token has already been revoked.
 * - Rotate refresh tokens safely while preventing reuse of old ones.
 *
 * ---
 * ### Notes
 * - Operates strictly at the **application layer**, orchestrating services but never performing cryptographic logic.
 * - Enforces **one-time-use refresh tokens** to prevent replay attacks.
 * - Throws {@link UnauthorizedError} for expired or previously revoked tokens.
 *
 * @param tokenService - The {@link TokenService} that handles JWT signing.
 * @param blacklistService - The {@link BlacklistService} managing revocation state.
 * @returns A {@link TokenUseCase} exposing JWT lifecycle operations.
 *
 * @see {@link TokenService}
 * @see {@link BlacklistService}
 * @see {@link TokenPair}
 */
export const tokenUseCase = (tokenService: TokenService, blacklistService: BlacklistService): TokenUseCase => {
  /**
   * **Generate Tokens**
   *
   * Issues a freshly signed **access + refresh token pair** for the provided payload.
   *
   * ---
   * ### Flow
   * 1. Delegates issuance to {@link TokenService.generateTokens}.
   * 2. Returns the resulting {@link TokenPair}.
   *
   * @param payload - The {@link TokenGenerateInput} (e.g., `sub`, `roles`).
   * @returns A {@link TokenPair} containing the new tokens.
   */
  const generateTokens = async (payload: TokenGenerateInput): Promise<TokenPair> => {
    return await tokenService.generateTokens(payload)
  }

  /**
   * **Revoke Refresh Token**
   *
   * Adds a refresh token’s JTI to the blacklist until its expiration time.
   * Ensures that once revoked, the token cannot be reused (e.g., after logout or rotation).
   *
   * ---
   * ### Flow
   * 1. Computes the remaining TTL (`exp - now`).
   * 2. Rejects expired tokens with {@link UnauthorizedError}.
   * 3. Persists the JTI in the blacklist using {@link BlacklistService}.
   *
   * @param payload - The {@link TokenRevokeInput} containing `exp` and `jti`.
   * @throws {UnauthorizedError} If the refresh token is already expired.
   */
  const revokeRefreshToken = async (payload: TokenRevokeInput): Promise<void> => {
    const { exp, jti } = payload
    const now = Math.floor(Date.now() / 1000)
    const ttl = exp - now

    if (ttl <= 0) throw new UnauthorizedError(`${path}.expired_refresh`)
    await blacklistService.revokeToken(jti, ttl)
  }

  /**
   * **Check Revocation Status**
   *
   * Verifies whether a given refresh token (by JTI) is already blacklisted.
   *
   * @param payload - The {@link TokenRevocationStatusInput} containing the token’s JTI.
   * @returns `true` if the token is revoked; otherwise `false`.
   */
  const isRefreshTokenRevoked = async (payload: TokenRevocationStatusInput): Promise<boolean> => {
    return await blacklistService.isTokenRevoked(payload.jti)
  }

  /**
   * **Rotate Tokens**
   *
   * Performs a secure rotation of refresh tokens while enforcing single-use.
   *
   * ---
   * ### Flow
   * 1. Checks if the provided JTI is already blacklisted.
   * 2. If revoked, throws {@link UnauthorizedError}.
   * 3. Calls {@link revokeRefreshToken} to blacklist the old token.
   * 4. Issues a fresh {@link TokenPair} using the same subject (`sub`).
   *
   * ---
   * ### Notes
   * - Prevents replay attacks by ensuring refresh tokens are invalid after use.
   * - Automatically revokes the current token before issuing new ones.
   *
   * @param payload - The {@link TokenRotateInput} containing `sub`, `exp`, and `jti`.
   * @returns A new {@link TokenPair} representing the rotated tokens.
   * @throws {UnauthorizedError} If the provided refresh token was already revoked.
   */
  const rotateTokens = async (payload: TokenRotateInput): Promise<TokenPair> => {
    const { sub, exp, jti } = payload

    const isRevoked = await blacklistService.isTokenRevoked(jti)
    if (isRevoked) throw new UnauthorizedError(`${path}.revoked_refresh`)

    await revokeRefreshToken({ exp, jti })
    return tokenService.generateTokens({ sub })
  }

  return {
    generateTokens,
    revokeRefreshToken,
    isRefreshTokenRevoked,
    rotateTokens,
  }
}
