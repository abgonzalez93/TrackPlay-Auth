/**
 * BlacklistService
 *
 * Defines the application-level contract for managing revoked tokens.
 * Used to ensure refresh tokens are single-use and prevent reuse attacks.
 */
export interface BlacklistService {
  /**
   * Adds a token's JTI to the blacklist, preventing future use.
   *
   * @param jti - Token identifier (JWT ID)
   * @param ttlSeconds - Time to live (seconds until token expiration)
   */
  revokeToken(jti: string, ttlSeconds: number): Promise<void>

  /**
   * Checks if a token has already been blacklisted.
   *
   * @param jti - Token identifier (JWT ID)
   * @returns `true` if revoked, `false` otherwise
   */
  isTokenRevoked(jti: string): Promise<boolean>
}
