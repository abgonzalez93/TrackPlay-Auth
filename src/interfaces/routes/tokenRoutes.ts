import { validateAuthToken } from '@middlewares/index'
import { container } from '@container/index'
import { Router } from 'express'

const tokenController = container.controllers.token

/**
 * **Token Routes**
 *
 * Defines all HTTP endpoints related to **JWT lifecycle management**, including:
 * - Token issuance (access + refresh)
 * - Revocation (logout)
 * - Rotation (refresh renewal)
 * - Revocation status checks
 *
 * ### Responsibilities
 * - Register all authentication-related routes under the `/auth` namespace.
 * - Delegate HTTP requests to the corresponding controller methods in {@link tokenController}.
 * - Protect sensitive routes with {@link validateAuthToken} for internal service-to-service calls.
 *
 * ### Notes
 * - Only internal services should call these routes (secured via `x-auth-token` header).
 * - Public clients should never access these endpoints directly.
 * - Responses are standardized using the {@link tokenController}.
 *
 * @see {@link tokenController} — Application controller handling token issuance, revocation, and rotation.
 * @see {@link validateAuthToken} — Middleware ensuring internal authorization for protected routes.
 */
export const tokenRoutes = Router()

tokenRoutes.post('/tokens', validateAuthToken, tokenController.generateTokens)
tokenRoutes.post('/revoke', validateAuthToken, tokenController.revokeToken)
tokenRoutes.get('/revoked', tokenController.isTokenRevoked)
tokenRoutes.post('/rotate', validateAuthToken, tokenController.rotateTokens)
