/**
 * **BlacklistService (interface)**
 *
 * Defines the **application-level contract** for managing revoked JWT tokens.
 * Ensures that refresh tokens follow a **single-use policy** to prevent replay or reuse attacks.
 *
 * ### Responsibilities
 * - Register revoked tokens (by their `jti`) with a defined lifetime.
 * - Verify whether a given token has already been revoked.
 * - Provide a consistent contract for higher-level use cases (e.g. {@link TokenUseCase}).
 *
 * ### Notes
 * - Operates purely at the **application layer**, delegating persistence to the {@link BlacklistPort}.
 * - Contains no storage or infrastructure logic — adapters handle that responsibility.
 */
export interface BlacklistService {
  /**
   * Adds a token’s unique identifier (`jti`) to the blacklist.
   *
   * @param jti - Unique token identifier (`jti` claim).
   * @param ttlSeconds - Time-to-live in seconds (usually `exp - now`).
   * @returns Resolves when the token has been successfully blacklisted.
   */
  revokeToken(jti: string, ttlSeconds: number): Promise<void>

  /**
   * Checks whether a token has already been revoked.
   *
   * @param jti - Unique token identifier (`jti` claim).
   * @returns `true` if the token is blacklisted; otherwise `false`.
   */
  isTokenRevoked(jti: string): Promise<boolean>
}
