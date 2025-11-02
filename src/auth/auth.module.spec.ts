import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { TOKEN_SERVICE } from './tokens';
import { ITokenService } from './application/ports/token-service.interface';

describe('AuthModule', () => {
  let module: TestingModule;
  let tokenService: ITokenService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.example',
        }),
        AuthModule,
      ],
    }).compile();

    tokenService = module.get<ITokenService>(TOKEN_SERVICE);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide TOKEN_SERVICE', () => {
    expect(tokenService).toBeDefined();
  });

  it('should generate and verify token using configured service', async () => {
    const payload = {
      sub: 'test-user-id',
      email: 'test@example.com',
    };

    const token = await tokenService.generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = await tokenService.verifyToken(token);
    expect(decoded.sub).toBe('test-user-id');
    expect(decoded.email).toBe('test@example.com');
  });
});
