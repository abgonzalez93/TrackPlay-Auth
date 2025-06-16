import { ForbiddenError, UnauthorizedError } from '@trackplay/core/errors'
import { AuthTokenSchema, AuthToken } from '@trackplay/core/schemas'
import { Request, Response, NextFunction } from 'express'
import { parseOrThrow } from '@trackplay/core/utils'
import { getEnvConfig } from '@config/config'

const { AUTH_SECRET_KEY } = getEnvConfig

/**
 * Middleware to validate internal auth token.
 * Only requests with a valid token in the `Authorization` or `x-auth-token` header are allowed.
 *
 * This protects internal services like the Auth microservice from external access.
 */
export const validateAuthToken = (req: Request, _res: Response, next: NextFunction): void => {
  const headers = req.headers['authorization'] || req.headers['x-auth-token']
  const rawToken = Array.isArray(headers) ? headers[0] : headers

  const token = parseOrThrow<AuthToken>(AuthTokenSchema, rawToken)
  const authSecret = token.replace(/^Bearer\s+/i, '').trim()

  if (!authSecret) throw new UnauthorizedError('Authorization token missing')
  if (!AUTH_SECRET_KEY || authSecret !== AUTH_SECRET_KEY) throw new ForbiddenError('Invalid authorization token')

  next()
}
