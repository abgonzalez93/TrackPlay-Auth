import { generateAccessToken, generateRefreshToken } from '@utils/index'
import { TokenPair } from '@trackplay/core/schemas'

/**
 * Service for handling operations related to JWT tokens.
 * Delegates token generation and verification to low-level utility functions.
 */
export const tokenService = {
  /**
   * Generates both access and refresh tokens for a given user ID.
   *
   * @param sub - The subject (sub) used in the token payload.
   * @returns A pair of access and refresh tokens.
   */
  generateTokens: async (sub: string): Promise<TokenPair> => {
    const accessToken = await generateAccessToken({ sub })
    const refreshToken = await generateRefreshToken({ sub })
    return { accessToken, refreshToken }
  },
}
