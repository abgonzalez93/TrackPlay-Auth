import { BlacklistService } from './blacklistService.interface'
import { BlacklistPort } from '@trackplay/core/ports'

/**
 * **Blacklist Service**
 *
 * Application-level service responsible for managing the **JWT revocation state**.
 *
 * This service defines *how* refresh tokens are blacklisted and *how* revocation
 * checks are performed within the application layer. It delegates persistence
 * and expiration handling to the underlying {@link BlacklistPort}, enabling
 * flexible infrastructure implementations (e.g., Redis, in-memory).
 *
 * ---
 * ### Responsibilities
 * - Revoke tokens by adding their JTI (JWT ID) to a blacklist.
 * - Verify whether a token has already been revoked.
 * - Abstract persistence details behind the {@link BlacklistPort}.
 * - Enforce one-time-use semantics for refresh tokens.
 *
 * ---
 * ### Notes
 * - Operates at the **application layer**, coordinating revocation between use cases and infrastructure.
 * - Contains **no direct storage logic** — persistence is handled entirely by the adapter.
 * - Commonly used by {@link TokenUseCase} during logout and token rotation flows.
 *
 * @param blacklistPort - The {@link BlacklistPort} providing low-level persistence for token JTIs.
 * @returns A {@link BlacklistService} exposing high-level revocation operations.
 *
 * @see {@link BlacklistPort}
 * @see {@link TokenUseCase}
 */
export const blacklistService = (blacklistPort: BlacklistPort): BlacklistService => {
  /**
   * **Revoke Token**
   *
   * Adds a token’s unique identifier (`jti`) to the blacklist,
   * preventing its reuse for the remainder of its lifetime.
   *
   * ---
   * ### Flow
   * 1. Receives the remaining lifetime (`ttlSeconds`), typically computed as `exp - now`.
   * 2. Delegates storage and expiration handling to {@link BlacklistPort.revokeToken}.
   *
   * @param jti - The token’s unique JWT identifier (`jti` claim).
   * @param ttlSeconds - Time to live in seconds (remaining validity period).
   * @returns Resolves once the token has been successfully blacklisted.
   */
  const revokeToken = async (jti: string, ttlSeconds: number): Promise<void> => {
    return await blacklistPort.revokeToken(jti, ttlSeconds)
  }

  /**
   * **Check Revocation Status**
   *
   * Checks whether a given token (identified by its JTI) has already been blacklisted.
   *
   * ---
   * ### Use Case
   * - Enforces **one-time-use refresh tokens** by detecting reuse attempts.
   *
   * @param jti - The token’s unique JWT identifier (`jti` claim).
   * @returns `true` if the token is blacklisted, otherwise `false`.
   */
  const isTokenRevoked = async (jti: string): Promise<boolean> => {
    return await blacklistPort.isTokenRevoked(jti)
  }

  return {
    revokeToken,
    isTokenRevoked,
  }
}
