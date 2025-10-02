import { createPrivateKey, randomUUID } from 'crypto'
import { TokenPort } from '@trackplay/core/ports'
import { JWT } from '@trackplay/core/constants'
import { SignJWT, JWTPayload } from 'jose'
import { readFileSync } from 'fs'
import path from 'path'

const privateKeyPath = path.resolve('/app/.files/jwt/private.key')
const privateKey = createPrivateKey(readFileSync(privateKeyPath, 'utf8'))

/**
 * **createJWT**
 *
 * Helper function for signing JSON Web Tokens using the `jose` library.
 *
 * ### Responsibilities
 * - Assemble the standard JWT claims (`iss`, `iat`, `exp`, `jti`, `typ`).
 * - Sign tokens using the RS256 algorithm and a private key.
 * - Support both `access` and `refresh` token types.
 *
 * ### Notes
 * - The expiration time is set in seconds relative to the current timestamp.
 * - If no JTI is provided, a new UUIDv4 is generated automatically.
 * - The private key is loaded from `/app/.files/jwt/private.key`.
 *
 * @param payload - Partial {@link JWTPayload} containing token claims.
 * @param type - Token type: `"access"` or `"refresh"`.
 * @param expiresIn - Token lifetime in seconds.
 * @param jti - Optional unique JWT identifier; generated if omitted.
 * @returns A signed JWT string.
 */
const createJWT = async (
  payload: Partial<JWTPayload>,
  type: 'access' | 'refresh',
  expiresIn: number,
  jti?: string,
): Promise<string> => {
  return await new SignJWT({ ...payload, typ: type })
    .setProtectedHeader({ alg: JWT.ALGORITHM })
    .setIssuer(JWT.ISSUER)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setJti(jti ?? randomUUID())
    .sign(privateKey)
}

/**
 * **JWT Adapter**
 *
 * Infrastructure-level implementation of the {@link TokenPort}, providing
 * a concrete mechanism to generate **RS256-signed JWT tokens** using the
 * [`jose`](https://github.com/panva/jose) library.
 *
 * This adapter defines **how** tokens are signed at the infrastructure layer,
 * while exposing a simple interface for application-level services such as
 * the {@link TokenService}.
 *
 * ### Responsibilities
 * - Sign access and refresh tokens with RS256.
 * - Apply standardized claims (issuer, issued-at, expiration, JTI).
 * - Delegate all cryptographic operations to the `jose` library.
 *
 * ### Notes
 * - Uses a private key loaded from `/app/.files/jwt/private.key`.
 * - The access and refresh token lifetimes are injected at instantiation.
 * - Should be instantiated via dependency injection in the infrastructure container.
 *
 * @param accessTokenTTL - Expiration time for access tokens (in seconds).
 * @param refreshTokenTTL - Expiration time for refresh tokens (in seconds).
 * @returns A {@link TokenPort} implementation backed by `jose`.
 *
 * @see {@link TokenPort}
 * @see {@link TokenService}
 * @see {@link TokenUseCase}
 */
export const jwtAdapter = (accessTokenTTL: number, refreshTokenTTL: number): TokenPort => {
  /**
   * **Generate Access Token**
   *
   * Issues a new RS256-signed **access token**.
   *
   * ### Flow
   * 1. Calls {@link createJWT} with type `"access"`.
   * 2. Applies the configured access token TTL.
   *
   * @param payload - Partial {@link JWTPayload} containing token claims.
   * @returns A signed access token string.
   */
  const generateAccessToken = async (payload: Partial<JWTPayload>): Promise<string> => {
    return createJWT(payload, 'access', accessTokenTTL)
  }

  /**
   * **Generate Refresh Token**
   *
   * Issues a new RS256-signed **refresh token**.
   *
   * ### Flow
   * 1. Calls {@link createJWT} with type `"refresh"`.
   * 2. Applies the configured refresh token TTL.
   *
   * @param payload - Partial {@link JWTPayload} containing token claims.
   * @returns A signed refresh token string.
   */
  const generateRefreshToken = async (payload: Partial<JWTPayload>): Promise<string> => {
    return createJWT(payload, 'refresh', refreshTokenTTL)
  }

  return {
    generateAccessToken,
    generateRefreshToken,
  }
}
