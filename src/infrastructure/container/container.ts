import { jwtAdapter, redisBlacklistAdapter } from '@adapters/index'
import { blacklistService, tokenService } from '@services/index'
import { tokenController } from '@controllers/index'
import { tokenUseCase } from '@useCases/index'
import { getEnvConfig } from '@config/index'
import { redis } from '@clients/index'

const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } = getEnvConfig

// --------------------
// Adapters
// --------------------
const blacklistAdapterInstance = redisBlacklistAdapter(redis)
const jwtAdapterInstance = jwtAdapter(ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL)

// --------------------
// Services
// --------------------
const blacklistServiceInstance = blacklistService(blacklistAdapterInstance)
const tokenServiceInstance = tokenService(jwtAdapterInstance)

// --------------------
// Use Cases
// --------------------
const tokenUseCaseInstance = tokenUseCase(tokenServiceInstance, blacklistServiceInstance)

// --------------------
// Controllers
// --------------------
const tokenControllerInstance = tokenController(tokenUseCaseInstance)

/**
 * Application Dependency Container
 *
 * Centralized dependency registry connecting all layers of the app
 * (Adapters, Services, Use Cases, Controllers).
 *
 * Responsibilities:
 * - Resolve all dependencies in a single place.
 * - Enforce provider-specific configuration injection.
 * - Prevent external layers from creating new instances manually.
 *
 * Layers:
 * - **Adapters** — Infrastructure-level implementations of ports (external APIs).
 * - **Services** — Business logic utilities and helpers.
 * - **Use Cases** — Application-level orchestration.
 * - **Controllers** — HTTP adapters (Express controllers).
 */
export const container = {
  adapters: {
    blacklist: blacklistAdapterInstance,
    jwt: jwtAdapterInstance,
  },
  services: {
    blacklist: blacklistServiceInstance,
    token: tokenServiceInstance,
  },
  useCases: {
    token: tokenUseCaseInstance,
  },
  controllers: {
    token: tokenControllerInstance,
  },
}

/**
 * Type representing the full dependency container.
 *
 * Exposes typed access to all adapters, services, use cases, and controllers.
 */
export type Container = typeof container
