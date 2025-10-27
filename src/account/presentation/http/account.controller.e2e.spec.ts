import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../../account.module';
import { UserSchema } from '../../infrastructure/persistence/typeorm/schemas/user.schema';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { HttpResponse } from './http-response.interface';
import { CreateAccountResponseDto } from '../../application/dtos/create-account-response.dto';

describe('AccountController (E2E)', () => {
  let app: INestApplication;
  const createAccountUseCase = {
    execute: () => ({
      id: 'test-user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      ],
    })
      .overrideProvider(CreateAccountUseCase)
      .useValue(createAccountUseCase)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST accounts should create user and return 201', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    return request(app.getHttpServer())
      .post('/accounts')
      .send(createUserDto)
      .expect(201)
      .expect((res) => {
        const responseBody = res.body as HttpResponse<CreateAccountResponseDto>;
        expect(responseBody.statusCode).toBe(201);
        expect(responseBody.body.email).toBe('test@example.com');
        expect(responseBody.body.id).toBe('test-user-id');
        expect(responseBody.body.createdAt).toBeDefined();
      });
  });
});
