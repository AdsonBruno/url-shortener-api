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
  });
});
