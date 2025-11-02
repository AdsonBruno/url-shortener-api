import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenService,
  TokenPayload,
} from '../../application/ports/token-service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(
    payload: Omit<TokenPayload, 'iat' | 'exp'>,
  ): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
