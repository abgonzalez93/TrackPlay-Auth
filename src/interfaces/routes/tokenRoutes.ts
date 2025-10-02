import { validateAuthToken } from '@middlewares/index'
import { container } from '@container/index'
import { Router } from 'express'

const tokenController = container.controllers.token

/**
 * Express router for auth endpoints.
 */
export const tokenRoutes = Router()

tokenRoutes.post('/tokens', validateAuthToken, tokenController.generateTokens)
tokenRoutes.post('/revoke', validateAuthToken, tokenController.revokeToken)
tokenRoutes.get('/revoked', tokenController.isTokenRevoked)
tokenRoutes.post('/rotate', validateAuthToken, tokenController.rotateTokens)
