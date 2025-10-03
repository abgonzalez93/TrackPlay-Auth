import {
  TokenGenerateInputSchema,
  TokenRevokeInputSchema,
  TokenRevocationStatusInputSchema,
  TokenRotateInputSchema,
} from '@trackplay/core/schemas'
import { getTranslationPath, validateSchema } from '@trackplay/core/utils'
import { HTTP_STATUS } from '@trackplay/core/constants'
import { TokenUseCase } from '@useCases/index'
import { Request, Response } from 'express'

const path = getTranslationPath(import.meta.url)

/**
 * **Token Controller**
 *
 * Express controller handling **authentication and token lifecycle endpoints**.
 *
 * Exposes REST endpoints for:
 * - Generating new access/refresh tokens.
 * - Revoking tokens (logout).
 * - Checking revocation status (diagnostic).
 * - Rotating tokens (refresh flow).
 *
 * ### Responsibilities
 * - Validate incoming HTTP requests via Zod schemas.
 * - Delegate business logic to the {@link TokenUseCase}.
 * - Format standardized JSON responses with appropriate HTTP status codes.
 *
 * ### Notes
 * - This controller does **not** contain business logic; it only coordinates
 *   between HTTP layer and application-level use cases.
 * - All schema validations are performed via {@link validateSchema}.
 * - Designed to integrate with an Express router (e.g. `/auth/tokens`).
 *
 * @param tokenUseCase - The {@link TokenUseCase} providing token lifecycle logic.
 * @returns An object exposing Express handlers for token-related routes.
 *
 * @see {@link TokenUseCase}
 * @see {@link validateSchema}
 * @see {@link TokenGenerateInputSchema}
 * @see {@link TokenRotateInputSchema}
 */
export const tokenController = (tokenUseCase: TokenUseCase) => {
  /**
   * **POST /tokens**
   *
   * Issues a new **access + refresh token pair** for a given user.
   *
   * ### Flow
   * 1. Validates the request body using {@link TokenGenerateInputSchema}.
   * 2. Calls {@link TokenUseCase.generateTokens}.
   * 3. Returns the newly issued tokens as JSON.
   *
   * @param req - Express request containing `{ sub: string }` in the body.
   * @param res - Express response sending the signed token pair.
   * @returns `200 OK` with a JSON object containing `{ accessToken, refreshToken }`.
   *
   */
  const generateTokens = async (req: Request, res: Response): Promise<void> => {
    const raw = validateSchema(TokenGenerateInputSchema, req.body, `${path}.invalid_generate_input`)
    const tokens = await tokenUseCase.generateTokens(raw)
    res.status(HTTP_STATUS.OK).json(tokens)
  }

  /**
   * **POST /revoke**
   *
   * Revokes a refresh token by blacklisting its `jti` until expiration.
   *
   * ### Flow
   * 1. Validates request body via {@link TokenRevokeInputSchema}.
   * 2. Calls {@link TokenUseCase.revokeRefreshToken}.
   * 3. Returns `204 No Content` on success.
   *
   * @param req - Express request containing `{ jti: string, exp: number }`.
   * @param res - Express response confirming revocation.
   * @returns `204 No Content` if successful.
   *
   * @remarks
   * Once revoked, the refresh token can no longer be reused or rotated.
   */
  const revokeToken = async (req: Request, res: Response): Promise<void> => {
    const raw = validateSchema(TokenRevokeInputSchema, req.body, `${path}.invalid_revoke_input`)
    await tokenUseCase.revokeRefreshToken(raw)
    res.status(HTTP_STATUS.NO_CONTENT).send()
  }

  /**
   * **GET /revoked**
   *
   * Checks whether a refresh token has been **revoked**.
   *
   * ### Flow
   * 1. Validates query string via {@link TokenRevocationStatusInputSchema}.
   * 2. Calls {@link TokenUseCase.isRefreshTokenRevoked}.
   * 3. Returns JSON `{ revoked: true | false }`.
   *
   * @param req - Express request with query parameter `{ jti }`.
   * @param res - Express response returning revocation status.
   * @returns `200 OK` with `{ revoked: boolean }`.
   *
   * @remarks
   * This endpoint is mainly for diagnostics or security audits.
   */
  const isTokenRevoked = async (req: Request, res: Response): Promise<void> => {
    const raw = validateSchema(TokenRevocationStatusInputSchema, req.query, `${path}.invalid_revocation_status_input`)
    const revoked = await tokenUseCase.isRefreshTokenRevoked(raw)
    res.status(HTTP_STATUS.OK).json({ revoked })
  }

  /**
   * **POST /rotate**
   *
   * Rotates a refresh token by:
   * 1. Checking if it has been revoked.
   * 2. Revoking the current token.
   * 3. Issuing a new **access + refresh** token pair.
   *
   * ### Flow
   * 1. Validates the request via {@link TokenRotateInputSchema}.
   * 2. Calls {@link TokenUseCase.rotateTokens}.
   * 3. Returns a fresh token pair.
   *
   * @param req - Express request containing `{ sub, jti, exp }` in the body.
   * @param res - Express response returning new `{ accessToken, refreshToken }`.
   * @returns `200 OK` with JSON containing new tokens.
   *
   * @remarks
   * Enforces one-time use of refresh tokens to prevent replay attacks.
   */
  const rotateTokens = async (req: Request, res: Response): Promise<void> => {
    const raw = validateSchema(TokenRotateInputSchema, req.body, `${path}.invalid_rotate_input`)
    const tokens = await tokenUseCase.rotateTokens(raw)
    res.status(HTTP_STATUS.OK).json(tokens)
  }

  return {
    generateTokens,
    revokeToken,
    isTokenRevoked,
    rotateTokens,
  }
}
