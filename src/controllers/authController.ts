import {
  TokenGenerationInputSchema,
  RefreshTokenRevokeInputSchema,
  RefreshTokenRevocationCheckSchema,
  RefreshTokenRotationInputSchema,
} from '@trackplay/core/schemas'
import { HTTP_STATUS } from '@trackplay/core/constants'
import { validateSchema } from '@trackplay/core/utils'
import { authService } from '@services/index'
import { Request, Response } from 'express'

/**
 * Controller for handling authentication-related endpoints.
 *
 * This controller exposes endpoints to issue and revoke JWT tokens
 * (access and refresh), as well as to check their revocation status.
 */
export const authController = {
  /**
   * Returns metadata about the available authentication routes.
   *
   * @route GET /
   * @param _req - Unused request object
   * @param res - Express response object
   * @returns A JSON object describing available endpoints
   */
  index: (_req: Request, res: Response): void => {
    res.status(HTTP_STATUS.OK).json({
      resource: 'auth',
      description: 'Authentication endpoints (tokens)',
      endpoints: [
        { method: 'POST', path: '/tokens', description: 'Generate new tokens for a userId' },
        { method: 'POST', path: '/revoke', description: 'Revoke a refresh token by its jti' },
        { method: 'GET', path: '/revoked', description: 'Check if a refresh token has been revoked' },
        { method: 'POST', path: '/rotate', description: 'Rotate an expired refresh token and issue new tokens' },
      ],
    })
  },

  /**
   * Issues a new pair of access and refresh tokens for a given user ID.
   *
   * This endpoint expects a user ID in the request body.
   * The ID must already be validated by the backend before making this call.
   *
   * @route POST /tokens
   * @param req - Express request containing `{ id: number }` in the body
   * @param res - Express response with a signed token pair
   */
  generateTokens: async (req: Request, res: Response): Promise<void> => {
    const data = validateSchema(TokenGenerationInputSchema, req.body)
    const tokens = await authService.generateTokens(data)
    res.status(HTTP_STATUS.OK).json(tokens)
  },

  /**
   * Revokes a refresh token by storing its `jti` in Redis with TTL.
   *
   * The token is no longer accepted after being revoked.
   * The expiration (`exp`) is used to set the TTL in Redis.
   *
   * @route POST /revoke
   * @param req - Express request containing `{ jti: string, exp: number }` in the body
   * @param res - Express response with 204 status if successful
   */
  revokeToken: async (req: Request, res: Response): Promise<void> => {
    const data = validateSchema(RefreshTokenRevokeInputSchema, req.body)
    await authService.revokeRefreshToken(data)
    res.status(HTTP_STATUS.NO_CONTENT).send()
  },

  /**
   * Checks whether a refresh token (by `jti`) has been revoked.
   *
   * This is a diagnostic or security tool to detect token reuse or logout status.
   *
   * @route GET /revoked
   * @param req - Express request with `jti` provided in the query string
   * @param res - Express response with a boolean `{ revoked: true | false }`
   */
  isTokenRevoked: async (req: Request, res: Response): Promise<void> => {
    const data = validateSchema(RefreshTokenRevocationCheckSchema, req.query)
    const revoked = await authService.isRefreshTokenRevoked(data)
    res.status(HTTP_STATUS.OK).json({ revoked })
  },

  /**
   * Rotates a refresh token by:
   * 1. Checking if the current refresh token has been revoked.
   * 2. Revoking the current refresh token.
   * 3. Issuing a new access and refresh token pair.
   *
   * This process ensures that the user gets new tokens for continued access while invalidating the old refresh token to maintain security.
   *
   * @route POST /rotate
   * @param req - Express request containing `{ sub: string, jti: string, exp: number }` in the body
   * @param res - Express response with a new pair of `accessToken` and `refreshToken`
   */
  rotateTokens: async (req: Request, res: Response): Promise<void> => {
    const data = validateSchema(RefreshTokenRotationInputSchema, req.body)
    const tokens = await authService.rotateTokens(data)
    res.status(HTTP_STATUS.OK).json(tokens)
  },
}
