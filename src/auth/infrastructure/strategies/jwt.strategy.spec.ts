import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { TokenPayload } from '../../application/ports/token-service.interface';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      JWT_SECRET: 'test-secret',
    });
    jwtStrategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should return token payload when valid', () => {
      const payload: TokenPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234571490,
      };

      const result = jwtStrategy.validate(payload);

      expect(result).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234571490,
      });
    });

    it('should throw UnauthorizedException when sub is missing', () => {
      const payload = {
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234571490,
      } as TokenPayload;

      expect(() => jwtStrategy.validate(payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => jwtStrategy.validate(payload)).toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when email is missing', () => {
      const payload = {
        sub: 'user-123',
        iat: 1234567890,
        exp: 1234571490,
      } as TokenPayload;

      expect(() => jwtStrategy.validate(payload)).toThrow(
        UnauthorizedException,
      );
      expect(() => jwtStrategy.validate(payload)).toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when both sub and email are missing', () => {
      const payload = {
        iat: 1234567890,
        exp: 1234571490,
      } as TokenPayload;

      expect(() => jwtStrategy.validate(payload)).toThrow(
        UnauthorizedException,
      );
    });

    it('should include iat and exp in returned payload', () => {
      const payload: TokenPayload = {
        sub: 'user-456',
        email: 'user@example.com',
        iat: 1111111111,
        exp: 1111114711,
      };

      const result = jwtStrategy.validate(payload);

      expect(result.iat).toBe(1111111111);
      expect(result.exp).toBe(1111114711);
    });
  });
});
