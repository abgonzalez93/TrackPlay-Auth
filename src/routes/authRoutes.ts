import { validateAuthToken } from '@middlewares/index'
import { authController } from '@controllers/index'
import { Router } from 'express'

/**
 * Express router for auth endpoints.
 */
export const authRoutes = Router()

authRoutes.get('/', authController.index)
authRoutes.post('/tokens', validateAuthToken, authController.generateTokens)
authRoutes.post('/revoke', validateAuthToken, authController.revokeToken)
authRoutes.get('/revoked', authController.isTokenRevoked)
authRoutes.post('/rotate', validateAuthToken, authController.rotateTokens)
