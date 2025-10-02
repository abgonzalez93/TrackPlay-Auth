import { getTranslationPath, validateSchema } from '@trackplay/core/utils'
import { ForbiddenError, UnauthorizedError } from '@trackplay/core/errors'
import { InternalAuthHeaderSchema } from '@trackplay/core/schemas'
import { getEnvConfig } from 'infrastructure/config/index'
import { Request, Response, NextFunction } from 'express'

const { AUTH_SECRET_KEY } = getEnvConfig
const path = getTranslationPath(import.meta.url)

/**
 * **Internal Auth Token Middleware**
 *
 * Express middleware that validates **internal service-to-service authentication**
 * via the `x-auth-token` header.
 *
 * This mechanism ensures that only trusted services (e.g., Auth, Catalog, IGDB)
 * can access protected internal routes by presenting a shared secret key.
 *
 * ### Responsibilities
 * - Extract and validate the `x-auth-token` header.
 * - Ensure the token follows the `Bearer <secret>` format.
 * - Verify the token matches the configured `AUTH_SECRET_KEY`.
 * - Reject unauthorized or malformed requests.
 *
 * ### Notes
 * - Designed exclusively for **internal communication** between trusted microservices.
 * - Not intended for end-user authentication (use JWT middleware for that).
 * - Relies on {@link InternalAuthHeaderSchema} for strict header validation.
 * - Throws {@link UnauthorizedError} or {@link ForbiddenError} on failure.
 *
 * ### Flow
 * 1. Extracts the `x-auth-token` header (handles array edge cases).
 * 2. Validates structure using {@link validateSchema}.
 * 3. Strips the `Bearer` prefix and compares with `AUTH_SECRET_KEY`.
 * 4. Calls `next()` only if validation passes.
 *
 * @param req - Express request object containing the `x-auth-token` header.
 * @param _res - Express response object (unused).
 * @param next - Express callback to continue request execution.
 *
 * @throws {UnauthorizedError} If the header is missing or malformed.
 * @throws {ForbiddenError} If the provided token does not match the secret key.
 *
 * @see {@link InternalAuthHeaderSchema}
 * @see {@link UnauthorizedError}
 * @see {@link ForbiddenError}
 * @see {@link validateSchema}
 */
export const validateAuthToken = (req: Request, _res: Response, next: NextFunction): void => {
  const raw = Array.isArray(req.headers['x-auth-token']) ? req.headers['x-auth-token'][0] : req.headers['x-auth-token']

  if (!raw) throw new UnauthorizedError(`${path}.auth_token_missing`)

  const header = validateSchema(InternalAuthHeaderSchema, raw, `${path}.auth_token_invalid`, UnauthorizedError)

  const authSecret = header.replace(/^Bearer\s+/i, '').trim()
  if (authSecret !== AUTH_SECRET_KEY) throw new ForbiddenError(`${path}.internal_token_unauthorized`)

  next()
}
