import { tokenRoutes } from '@routes/index'
import { Express } from 'express'

/**
 * **Route Registrar**
 *
 * Registers all HTTP routes exposed by the **Auth Service**.
 *
 * This function serves as the single entry point for route registration,
 * grouping all endpoints under their respective base paths.
 *
 * ### Responsibilities
 * - Mounts all route modules (e.g., `tokenRoutes`) on their corresponding prefixes.
 * - Ensures a consistent routing structure across services.
 *
 * ### Notes
 * - All routes are mounted under the `/auth` namespace.
 * - This function should be passed to the {@link bootstrap} helper during initialization.
 *
 * @param app - The Express application instance used to register routes.
 *
 * @see {@link tokenRoutes} - Contains all token-related endpoints (issue, revoke, rotate, etc.).
 * @see {@link bootstrap} - Helper responsible for starting the service with registered routes.
 */
export const routes = (app: Express): void => {
  app.use('/auth', tokenRoutes)
}
