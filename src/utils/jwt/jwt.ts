import { createPrivateKey, randomUUID } from 'crypto'
import { JWT } from '@trackplay/core/constants'
import { getEnvConfig } from '@config/index'
import { SignJWT, JWTPayload } from 'jose'
import { readFileSync } from 'fs'
import path from 'path'

const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } = getEnvConfig

const privateKeyPath = path.resolve('/app/.files/jwt/private.key')
const privateKey = createPrivateKey(readFileSync(privateKeyPath, 'utf8'))

/**
 * Signs a new JWT using RS256 algorithm.
 *
 * @param payload - JWT payload to embed in the token
 * @param type - Token type: 'access' or 'refresh'
 * @param expiresIn - Token lifetime (e.g., 900 for 15min, 604800 for 7d)
 * @param jti - Optional JWT ID
 * @returns A signed JWT string
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
 * Generates a short-lived access token.
 *
 * @param payload - JWT claims to include (e.g., sub)
 * @returns A signed access token
 */
export const generateAccessToken = (payload: Partial<JWTPayload>): Promise<string> =>
  createJWT(payload, 'access', ACCESS_TOKEN_TTL)

/**
 * Generates a long-lived refresh token.
 *
 * @param payload - JWT claims to include (e.g., sub)
 * @returns A signed refresh token
 */
export const generateRefreshToken = (payload: Partial<JWTPayload>): Promise<string> =>
  createJWT(payload, 'refresh', REFRESH_TOKEN_TTL)
