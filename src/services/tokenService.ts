import { generateAccessToken, generateRefreshToken } from '@utils/index'
import { TokenGenerationInput, SignedTokenPair } from '@trackplay/core/schemas'

/**
 * Service for handling operations related to JWT tokens.
 * Delegates token generation and verification to low-level utility functions.
 */
export const tokenService = {
  /**
   * Generates a pair of access and refresh tokens for a given subject.
   *
   * @param payload - Payload containing the subject (`sub`) to be used in the token payload
   * @returns A promise resolving to an access/refresh token pair
   */
  generateTokens: async (payload: TokenGenerationInput): Promise<SignedTokenPair> => {
    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)
    return { accessToken, refreshToken }
  },
}
