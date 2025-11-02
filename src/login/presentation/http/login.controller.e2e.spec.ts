import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from '../../login.module';
import { AccountModule } from '../../../account/account.module';
import { UserSchema } from '../../../account/infrastructure/persistence/typeorm/schemas/user.schema';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { HttpResponse } from 'src/account/presentation/http/http-response.interface';
import { LoginResponseDto } from 'src/login/application/dtos/login-response.dto';

describe('LoginController (E2E)', () => {
  let app: INestApplication;
  const loginUseCase = {
    execute: () => ({
      success: true,
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'test.jwt.token',
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserSchema],
          synchronize: true,
          logging: false,
        }),
        AccountModule,
        LoginModule,
      ],
    })
      .overrideProvider(LoginUseCase)
      .useValue(loginUseCase)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST login should authenticate user and return 200', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    return request(app.getHttpServer())
      .post('/login')
      .send(loginDto)
      .expect(200)
      .expect((res) => {
        const responseBody = res.body as HttpResponse<LoginResponseDto>;
        expect(responseBody.statusCode).toBe(200);
        expect(responseBody.body.success).toBe(true);
        expect(responseBody.body.user.email).toBe('test@example.com');
        expect(responseBody.body.user.id).toBe('test-user-id');
        expect(responseBody.body.accessToken).toBe('test.jwt.token');
        expect(responseBody.body.accessToken).toBeDefined();
      });
  });
});
