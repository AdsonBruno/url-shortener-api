import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { AccountController } from './account.controller';
import { User } from '../../domain/entities/user.entity';
import { CreateAccountDto } from '../../application/dtos/create-account.dto';
import { HttpStatus } from '@nestjs/common';

describe('AccountController', () => {
  let controller: AccountController;
  let createAccountUseCase: CreateAccountUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: CreateAccountUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    createAccountUseCase =
      module.get<CreateAccountUseCase>(CreateAccountUseCase);
  });

  describe('POST/accounts', () => {
    it('should create account successfully', async () => {
      const mockUser = User.create({
        id: 'user_id',
        email: 'user_email@mail.com',
        password: 'hashed_password',
      });

      const createAccountDto: CreateAccountDto = {
        email: 'user_email@mail.com',
        password: 'valid_password',
      };

      jest.spyOn(createAccountUseCase, 'execute').mockResolvedValue(mockUser);

      const httpResponse = await controller.createAccount(createAccountDto);

      expect(httpResponse.statusCode).toBe(HttpStatus.CREATED);
      expect(httpResponse.body).toEqual({
        id: 'user_id',
        email: 'user_email@mail.com',
        createdAt: mockUser.createdAt,
      });
    });

    it('should return conflict when user already exists', async () => {
      const createAccountDto: CreateAccountDto = {
        email: 'existing@mail.com',
        password: 'valid_password',
      };

      jest
        .spyOn(createAccountUseCase, 'execute')
        .mockRejectedValue(new Error('User already exists'));

      const httpResponse = await controller.createAccount(createAccountDto);

      expect(httpResponse.statusCode).toBe(HttpStatus.CONFLICT);
      expect(httpResponse.body).toEqual({
        message: 'User already exists',
      });
    });

    it('should return bad request for invalid email', async () => {
      const createAccountDto: CreateAccountDto = {
        email: 'invalid-email',
        password: 'valid_password',
      };

      jest
        .spyOn(createAccountUseCase, 'execute')
        .mockRejectedValue(new Error('Invalid email format'));

      const httpResponse = await controller.createAccount(createAccountDto);

      expect(httpResponse.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(httpResponse.body).toEqual({
        message: 'Invalid email format',
      });
    });

    it('should return internal server error for unknown errors', async () => {
      const createAccountDto: CreateAccountDto = {
        email: 'user@mail.com',
        password: 'valid_password',
      };

      jest
        .spyOn(createAccountUseCase, 'execute')
        .mockRejectedValue(new Error('Database connection failed'));

      const httpResponse = await controller.createAccount(createAccountDto);

      expect(httpResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(httpResponse.body).toEqual({
        message: 'Internal server error',
      });
    });
  });
});
