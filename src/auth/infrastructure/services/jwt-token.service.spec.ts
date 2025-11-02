import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';
import { TokenPayload } from '../../application/ports/token-service.interface';

describe('JwtTokenService', () => {
  let jwtTokenService: JwtTokenService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-secret',
      signOptions: { expiresIn: '1h' },
    });
    jwtTokenService = new JwtTokenService(jwtService);
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      const token = await jwtTokenService.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', async () => {
      const payload = {
        sub: 'user-456',
        email: 'user@example.com',
      };

      const token = await jwtTokenService.generateToken(payload);
      const decoded = await jwtService.verifyAsync<TokenPayload>(token);

      expect(decoded.sub).toBe('user-456');
      expect(decoded.email).toBe('user@example.com');
    });

    it('should generate different tokens for different payloads', async () => {
      const payload1 = {
        sub: 'user-1',
        email: 'user1@example.com',
      };
      const payload2 = {
        sub: 'user-2',
        email: 'user2@example.com',
      };

      const token1 = await jwtTokenService.generateToken(payload1);
      const token2 = await jwtTokenService.generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      const payload = {
        sub: 'user-789',
        email: 'verify@example.com',
      };

      const token = await jwtTokenService.generateToken(payload);
      const decoded = await jwtTokenService.verifyToken(token);

      expect(decoded.sub).toBe('user-789');
      expect(decoded.email).toBe('verify@example.com');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.string';

      await expect(jwtTokenService.verifyToken(invalidToken)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw error for malformed token', async () => {
      const malformedToken = 'not-a-jwt-token';

      await expect(jwtTokenService.verifyToken(malformedToken)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw error for expired token', async () => {
      // Create a token that expires immediately
      const expiredJwtService = new JwtService({
        secret: 'test-secret',
        signOptions: { expiresIn: '0s' },
      });
      const expiredTokenService = new JwtTokenService(expiredJwtService);

      const payload = {
        sub: 'user-expired',
        email: 'expired@example.com',
      };

      const token = await expiredTokenService.generateToken(payload);

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      await expect(jwtTokenService.verifyToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw error for token with wrong signature', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
      };

      const token = await jwtTokenService.generateToken(payload);

      // Create service with different secret
      const differentJwtService = new JwtService({
        secret: 'different-secret',
      });
      const differentTokenService = new JwtTokenService(differentJwtService);

      await expect(differentTokenService.verifyToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
    });
  });

  describe('token lifecycle', () => {
    it('should generate and verify token in complete flow', async () => {
      const originalPayload = {
        sub: 'lifecycle-user',
        email: 'lifecycle@example.com',
      };

      // Generate token
      const token = await jwtTokenService.generateToken(originalPayload);
      expect(token).toBeDefined();

      // Verify token
      const verifiedPayload = await jwtTokenService.verifyToken(token);
      expect(verifiedPayload.sub).toBe(originalPayload.sub);
      expect(verifiedPayload.email).toBe(originalPayload.email);
    });
  });
});
