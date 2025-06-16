import { authRoutes } from '@routes/index'
import { Express } from 'express'

/**
 * Registers all application routes.
 *
 * @param app - The Express application instance
 */
export const routes = (app: Express): void => {
  app.use('/auth', authRoutes)
}
