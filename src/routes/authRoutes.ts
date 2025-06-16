import { validateAuthToken } from '@middlewares/index'
import { authController } from '@controllers/index'
import { Router } from 'express'

/**
 * Express router for auth endpoints.
 */
export const authRoutes = Router()

authRoutes.get('/', authController.index)
authRoutes.post('/tokens', validateAuthToken, authController.generateTokens)
authRoutes.post('/revoke', validateAuthToken, authController.revokeRefreshToken)
authRoutes.post('/rotate', validateAuthToken, authController.rotateTokens)
authRoutes.post('/rotate', authController.rotateTokens)
