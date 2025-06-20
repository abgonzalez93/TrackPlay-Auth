import { validateInternalAuthToken } from '@middlewares/index'
import { authController } from '@controllers/index'
import { Router } from 'express'

/**
 * Express router for auth endpoints.
 */
export const authRoutes = Router()

authRoutes.get('/', authController.index)
authRoutes.post('/tokens', validateInternalAuthToken, authController.generateTokens)
authRoutes.post('/revoke', validateInternalAuthToken, authController.revokeRefreshToken)
authRoutes.get('/revoked', authController.isRefreshTokenRevoked)
authRoutes.post('/rotate', validateInternalAuthToken, authController.rotateTokens)
