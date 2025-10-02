import { BlacklistService } from './blacklistService.interface'
import { BlacklistPort } from '@trackplay/core/ports'

/**
 * **Blacklist Service**
 *
 * Application-level service responsible for managing **JWT revocation state**.
 *
 * This service defines **how** tokens are blacklisted and **how** revocation
 * checks are performed within the application layer. It delegates persistence
 * and expiration handling to the underlying {@link BlacklistPort}, allowing
 * flexible infrastructure implementations (e.g., Redis, in-memory).
 *
 * ### Responsibilities
 * - Revoke tokens by adding their JTI (JWT ID) to a blacklist.
 * - Verify whether a token has already been revoked.
 * - Abstract infrastructure concerns behind the {@link BlacklistPort}.
 * - Ensure revoked tokens cannot be reused (logout and rotation enforcement).
 *
 * ### Notes
 * - Operates at the **application layer**, coordinating between use cases and persistence.
 * - This service contains **no storage logic** — that is handled entirely by the adapter.
 * - Typically used by {@link TokenUseCase} during logout and refresh operations.
 *
 * @param blacklistPort - The {@link BlacklistPort} providing low-level blacklist persistence.
 * @returns An instance of {@link BlacklistService} exposing revocation utilities.
 *
 * @see {@link BlacklistPort}
 * @see {@link TokenUseCase}
 */
export const blacklistService = (blacklistPort: BlacklistPort): BlacklistService => {
  /**
   * **Revoke Token**
   *
   * Adds a token’s unique identifier (`jti`) to the blacklist, preventing
   * its reuse for the duration of its remaining lifetime.
   *
   * ### Flow
   * 1. Calculates remaining TTL externally.
   * 2. Delegates storage and expiry handling to {@link BlacklistPort.revokeToken}.
   *
   * @param jti - Unique JWT identifier (`jti` claim).
   * @param ttlSeconds - Time-to-live in seconds (usually `exp - now`).
   * @returns Resolves when the token is successfully blacklisted.
   */
  const revokeToken = async (jti: string, ttlSeconds: number): Promise<void> => {
    return await blacklistPort.revokeToken(jti, ttlSeconds)
  }

  /**
   * **Check Revocation Status**
   *
   * Determines whether a given token identifier (`jti`) is present in the blacklist.
   *
   * @param jti - Unique JWT identifier (`jti` claim).
   * @returns `true` if the token has been revoked; otherwise, `false`.
   *
   * @remarks
   * Used to enforce one-time-use refresh tokens during rotation.
   */
  const isTokenRevoked = async (jti: string): Promise<boolean> => {
    return await blacklistPort.isTokenRevoked(jti)
  }

  return {
    revokeToken,
    isTokenRevoked,
  }
}
