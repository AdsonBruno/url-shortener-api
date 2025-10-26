import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { AccountController } from './account.controller';
import { User } from '../../domain/entities/user.entity';
import { CreateAccountDto } from '../../application/dtos/create-account.dto';

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

      expect(httpResponse).toEqual({
        id: 'user_id',
        email: 'user_email@mail.com',
        createdAt: mockUser.createdAt,
      });
    });
  });
});
