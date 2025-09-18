import { ForbiddenError, UnauthorizedError } from '@trackplay/core/errors'
import { InternalAuthHeaderSchema } from '@trackplay/core/schemas'
import { Request, Response, NextFunction } from 'express'
import { validateSchema } from '@trackplay/core/utils'
import { getEnvConfig } from '@config/config'

const { AUTH_SECRET_KEY } = getEnvConfig

const path = 'auth.middlewares.validateAuthToken'

/**
 * Middleware to validate internal service-to-service authentication.
 * Only requests with a valid `x-auth-token` header are allowed.
 *
 * This protects internal services like the Auth microservice from external access.
 */
export const validateAuthToken = (req: Request, _res: Response, next: NextFunction): void => {
  const rawHeader = Array.isArray(req.headers['x-auth-token'])
    ? req.headers['x-auth-token'][0]
    : req.headers['x-auth-token']

  if (!rawHeader) throw new UnauthorizedError(`${path}.auth_token_missing`)

  const header = validateSchema(InternalAuthHeaderSchema, rawHeader, `${path}.auth_token_invalid`, UnauthorizedError)
  const authSecret = header.replace(/^Bearer\s+/i, '').trim()

  if (authSecret !== AUTH_SECRET_KEY) throw new ForbiddenError(`${path}.internal_token_unauthorized`)

  next()
}
