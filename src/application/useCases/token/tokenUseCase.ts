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
 * Application-level orchestrator responsible for managing the **JWT lifecycle** —
 * including generation, validation, rotation, and revocation of tokens.
 *
 * This use case coordinates between the {@link TokenService} (for issuing tokens)
 * and the {@link BlacklistService} (for enforcing single-use refresh logic).
 *
 * ### Responsibilities
 * - Generate new access + refresh token pairs.
 * - Revoke tokens by blacklisting their JTI identifiers.
 * - Verify whether a refresh token has been revoked.
 * - Safely rotate tokens while preventing reuse of old ones.
 *
 * ### Notes
 * - Operates at the **application layer** — it coordinates domain services but contains no cryptographic logic.
 * - Enforces **one-time-use refresh tokens** to mitigate replay attacks.
 * - Uses {@link UnauthorizedError} to represent invalid or expired refresh operations.
 *
 * @param tokenService - The {@link TokenService} responsible for signing and issuing JWTs.
 * @param blacklistService - The {@link BlacklistService} handling token revocation state.
 * @returns A {@link TokenUseCase} exposing the JWT lifecycle operations.
 *
 * @see {@link TokenService}
 * @see {@link BlacklistService}
 * @see {@link TokenPair}
 */
export const tokenUseCase = (tokenService: TokenService, blacklistService: BlacklistService): TokenUseCase => {
  /**
   * **Generate Tokens**
   *
   * Issues a new signed **access + refresh token pair** using the provided payload.
   *
   * ### Flow
   * 1. Delegates to {@link TokenService.generateTokens}.
   * 2. Returns the resulting {@link TokenPair}.
   *
   * @param payload - The {@link TokenGenerateInput} data (e.g., `sub`, `roles`).
   * @returns A {@link TokenPair} containing access and refresh tokens.
   */
  const generateTokens = async (payload: TokenGenerateInput): Promise<TokenPair> => {
    return await tokenService.generateTokens(payload)
  }

  /**
   * **Revoke Refresh Token**
   *
   * Blacklists a refresh token by its unique JTI until its expiration time.
   * Ensures that the token cannot be reused after logout or rotation.
   *
   * ### Flow
   * 1. Calculates remaining lifetime (`exp - now`).
   * 2. Rejects expired tokens with {@link UnauthorizedError}.
   * 3. Stores the JTI in the {@link BlacklistService}.
   *
   * @param payload - The {@link TokenRevokeInput} containing token `exp` and `jti`.
   * @throws {UnauthorizedError} If the token is already expired.
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
   * Verifies if a given refresh token has already been revoked.
   *
   * @param payload - The {@link TokenRevocationStatusInput} containing the JTI.
   * @returns `true` if the token is blacklisted, otherwise `false`.
   */
  const isRefreshTokenRevoked = async (payload: TokenRevocationStatusInput): Promise<boolean> => {
    return await blacklistService.isTokenRevoked(payload.jti)
  }

  /**
   * **Rotate Tokens**
   *
   * Safely rotates refresh tokens while enforcing one-time usage.
   *
   * ### Flow
   * 1. Checks if the provided token JTI is blacklisted.
   * 2. If revoked, throws {@link UnauthorizedError}.
   * 3. Revokes the current refresh token via {@link revokeRefreshToken}.
   * 4. Issues a new {@link TokenPair} using the token `sub`.
   *
   * ### Notes
   * - Prevents replay attacks by ensuring refresh tokens are invalidated after use.
   * - Automatically triggers blacklist storage on rotation.
   *
   * @param payload - The {@link TokenRotateInput} containing the `sub`, `exp`, and `jti`.
   * @returns A new {@link TokenPair} with freshly issued tokens.
   *
   * @throws {UnauthorizedError} If the provided refresh token has been revoked.
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
