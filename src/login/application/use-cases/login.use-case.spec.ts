import { LoginUseCase } from './login.use-case';
import { LoginDto } from '../dtos/login.dto';
import { IUserRepository } from '../../../account/domain/repositories/user.repository';
import { IPasswordHasher } from '../../../account/application/ports/password-hasher.interface';
import { User } from '../../../account/domain/entities/user.entity';

describe('LoginUseCase', () => {
  class UserRepositoryStub implements IUserRepository {
    async findByEmail(_: string): Promise<User | null> {
      const user = User.create({
        id: 'valid_user_id',
        email: 'valid_email@mail.com',
        password: 'hashed_password',
      });
      return Promise.resolve(user);
    }

    async findById(_: string): Promise<User | null> {
      return Promise.resolve<User | null>(null);
    }

    async save(_: User): Promise<void> {
      return Promise.resolve();
    }
  }

  class PasswordHasherStub implements IPasswordHasher {
    async hash(_: string): Promise<string> {
      return Promise.resolve('hashed_password');
    }

    async compare(_: string, __: string): Promise<boolean> {
      return Promise.resolve(true);
    }
  }

  interface SutTypes {
    sut: LoginUseCase;
    userRepositoryStub: IUserRepository;
    passwordHasherStub: IPasswordHasher;
  }

  const makeSut = (): SutTypes => {
    const userRepositoryStub = new UserRepositoryStub();
    const passwordHasherStub = new PasswordHasherStub();
    const sut = new LoginUseCase(userRepositoryStub, passwordHasherStub);

    return {
      sut,
      userRepositoryStub,
      passwordHasherStub,
    };
  };

  describe('Input Validation', () => {
    it('should throw error when email is empty', async () => {
      const { sut } = makeSut();

      const invalidInput: LoginDto = {
        email: '',
        password: 'valid_password',
      };

      const promise = sut.execute(invalidInput);

      await expect(promise).rejects.toThrow('Email is required');
    });

    it('should throw error when email is null', async () => {
      const { sut } = makeSut();

      const invalidInput = {
        password: 'valid_password',
      } as LoginDto;

      const promise = sut.execute(invalidInput);

      await expect(promise).rejects.toThrow('Email is required');
    });

    it('should throw error when password is empty', async () => {
      const { sut } = makeSut();

      const invalidInput: LoginDto = {
        email: 'valid_email@mail.com',
        password: '',
      };

      const promise = sut.execute(invalidInput);

      await expect(promise).rejects.toThrow('Password is required');
    });

    it('should throw error when password is null', async () => {
      const { sut } = makeSut();

      const invalidInput = {
        email: 'valid_email@mail.com',
      } as LoginDto;

      const promise = sut.execute(invalidInput);

      await expect(promise).rejects.toThrow('Password is required');
    });

    it('should throw error when email format is invalid', async () => {
      const { sut } = makeSut();

      const invalidInput: LoginDto = {
        email: 'invalid_email',
        password: 'valid_password',
      };

      const promise = sut.execute(invalidInput);

      await expect(promise).rejects.toThrow('Invalid email format');
    });
  });

  describe('Authentication Logic', () => {
    it('should throw error when user does not exist', async () => {
      const { sut, userRepositoryStub } = makeSut();

      jest.spyOn(userRepositoryStub, 'findByEmail').mockResolvedValue(null);

      const validInput: LoginDto = {
        email: 'nonexistent@mail.com',
        password: 'valid_password',
      };

      const promise = sut.execute(validInput);

      await expect(promise).rejects.toThrow('Invalid credentials');
    });

    it('should call userRepository.findByEmail with correct email', async () => {
      const { sut, userRepositoryStub } = makeSut();

      const findByEmailSpy = jest.spyOn(userRepositoryStub, 'findByEmail');

      const validInput: LoginDto = {
        email: 'test@mail.com',
        password: 'valid_password',
      };

      await sut.execute(validInput);

      expect(findByEmailSpy).toHaveBeenCalledWith('test@mail.com');
    });

    it('should call passwordHasher.compare with correct parameters', async () => {
      const { sut, passwordHasherStub } = makeSut();

      const compareSpy = jest.spyOn(passwordHasherStub, 'compare');

      const validInput: LoginDto = {
        email: 'valid_email@mail.com',
        password: 'plain_password',
      };

      await sut.execute(validInput);

      expect(compareSpy).toHaveBeenCalledWith(
        'plain_password',
        'hashed_password',
      );
    });

    it('should throw error when password does not match', async () => {
      const { sut, passwordHasherStub } = makeSut();

      jest.spyOn(passwordHasherStub, 'compare').mockResolvedValue(false);

      const validInput: LoginDto = {
        email: 'valid_email@mail.com',
        password: 'wrong_password',
      };

      const promise = sut.execute(validInput);

      await expect(promise).rejects.toThrow('Invalid credentials');
    });

    it('should return user data when credentials are valid', async () => {
      const { sut } = makeSut();

      const validInput: LoginDto = {
        email: 'valid_email@mail.com',
        password: 'correct_password',
      };

      const result = await sut.execute(validInput);

      expect(result).toEqual({
        success: true,
        user: {
          id: 'valid_user_id',
          email: 'valid_email@mail.com',
        },
      });
    });

    it('should not return password in response', async () => {
      const { sut } = makeSut();

      const validInput: LoginDto = {
        email: 'valid_email@mail.com',
        password: 'correct_password',
      };

      const result = await sut.execute(validInput);

      expect(result.user).not.toHaveProperty('password');
      expect(result.success).toBe(true);
    });
  });

  describe('Repository Integration', () => {
    it('should handle repository errors gracefully', async () => {
      const { sut, userRepositoryStub } = makeSut();

      jest
        .spyOn(userRepositoryStub, 'findByEmail')
        .mockRejectedValue(new Error('Database connection failed'));

      const validInput: LoginDto = {
        email: 'test@mail.com',
        password: 'valid_password',
      };

      const promise = sut.execute(validInput);

      await expect(promise).rejects.toThrow('Database connection failed');
    });
  });

  describe('Password Hasher Integration', () => {
    it('should handle password hasher errors gracefully', async () => {
      const { sut, passwordHasherStub } = makeSut();

      jest
        .spyOn(passwordHasherStub, 'compare')
        .mockRejectedValue(new Error('Hashing library error'));

      const validInput: LoginDto = {
        email: 'valid_email@mail.com',
        password: 'valid_password',
      };

      const promise = sut.execute(validInput);

      await expect(promise).rejects.toThrow('Hashing library error');
    });
  });
});
