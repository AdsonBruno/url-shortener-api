export interface TokenPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface ITokenService {
  /**
   * Generate a JWT token for a user
   * @param payload - Token payload containing user information
   * @returns JWT token string
   */
  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string>;

  /**
   * Verify and decode a JWT token
   * @param token - JWT token string
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyToken(token: string): Promise<TokenPayload>;
}
