import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../../application/dtos/login.dto';

describe('LoginController', () => {
  let controller: LoginController;
  let loginUseCase: LoginUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  describe('POST /login', () => {
    it('should return success response when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'validPassword123',
      };

      const mockLoginResponse = {
        success: true,
        user: {
          id: 'user-id-123',
          email: 'user@example.com',
        },
      };

      jest.spyOn(loginUseCase, 'execute').mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.body).toEqual(mockLoginResponse);
    });

    it('should call LoginUseCase.execute with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'testPassword',
      };

      const mockLoginResponse = {
        success: true,
        user: {
          id: 'user-id-123',
          email: 'test@example.com',
        },
      };

      const executeSpy = jest
        .spyOn(loginUseCase, 'execute')
        .mockResolvedValue(mockLoginResponse);

      await controller.login(loginDto);

      expect(executeSpy).toHaveBeenCalledWith(loginDto);
      expect(executeSpy).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when email is empty', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: 'validPassword',
      };

      jest
        .spyOn(loginUseCase, 'execute')
        .mockRejectedValue(new Error('Email is required'));

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.body).toEqual({
        message: 'Email is required',
      });
    });

    it('should return 400 when password is empty', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: '',
      };

      jest
        .spyOn(loginUseCase, 'execute')
        .mockRejectedValue(new Error('Password is required'));

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.body).toEqual({
        message: 'Password is required',
      });
    });

    it('should return 400 when email format is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'invalid-email',
        password: 'validPassword',
      };

      jest
        .spyOn(loginUseCase, 'execute')
        .mockRejectedValue(new Error('Invalid email format'));

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.body).toEqual({
        message: 'Invalid email format',
      });
    });

    it('should return 401 when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'wrongPassword',
      };

      jest
        .spyOn(loginUseCase, 'execute')
        .mockRejectedValue(new Error('Invalid credentials'));

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.body).toEqual({
        message: 'Invalid credentials',
      });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'validPassword',
      };

      jest
        .spyOn(loginUseCase, 'execute')
        .mockRejectedValue(new Error('Database connection failed'));

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.body).toEqual({
        message: 'Internal server error',
      });
    });

    it('should handle non-Error exceptions', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'validPassword',
      };

      jest.spyOn(loginUseCase, 'execute').mockRejectedValue('String error');

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.body).toEqual({
        message: 'Internal server error',
      });
    });

    it('should return correct HTTP status code in response body', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'validPassword',
      };

      const mockLoginResponse = {
        success: true,
        user: {
          id: 'user-id-123',
          email: 'user@example.com',
        },
      };

      jest.spyOn(loginUseCase, 'execute').mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(200);
      expect(result.body).toEqual(mockLoginResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle UseCase throwing null', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'validPassword',
      };

      jest.spyOn(loginUseCase, 'execute').mockRejectedValue(null);

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.body).toEqual({
        message: 'Internal server error',
      });
    });

    it('should handle UseCase throwing undefined', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'validPassword',
      };

      jest.spyOn(loginUseCase, 'execute').mockRejectedValue(undefined);

      const result = await controller.login(loginDto);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.body).toEqual({
        message: 'Internal server error',
      });
    });
  });
});
