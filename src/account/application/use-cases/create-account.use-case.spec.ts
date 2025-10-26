import { CreateAccountUseCase } from './create-account.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { User } from '../../domain/entities/user.entity';
import { IIdGenerator } from '../ports/id-generator.interface';

describe('CreateAccountUseCase', () => {
  class UserRepositoryStub implements IUserRepository {
    findByEmail(_: string): Promise<User | null> {
      return Promise.resolve(null);
    }
    findById(_: string): Promise<User | null> {
      throw new Error('Method not implemented.');
    }
    async save(_: User): Promise<void> {
      return Promise.resolve();
    }
  }

  class PasswordHasherStub implements IPasswordHasher {
    compare(_: string): Promise<boolean> {
      throw new Error('Method not implemented.');
    }
    async hash(_: string): Promise<string> {
      return Promise.resolve('any_password');
    }
  }

  class IdGeneratorStub implements IIdGenerator {
    generate(): string {
      return 'any_uuid';
    }
  }

  interface SutTypes {
    sut: CreateAccountUseCase;
    userRepositoryStub: IUserRepository;
    passwordHasherStub: IPasswordHasher;
    idGeneratorStub: IIdGenerator;
  }

  const makeSut = (): SutTypes => {
    const userRepositoryStub = new UserRepositoryStub();
    const passwordHasherStub = new PasswordHasherStub();
    const idGeneratorStub = new IdGeneratorStub();

    const sut = new CreateAccountUseCase(
      userRepositoryStub,
      passwordHasherStub,
      idGeneratorStub,
    );

    return {
      sut,
      userRepositoryStub,
      passwordHasherStub,
      idGeneratorStub,
    };
  };

  describe('Input Validation', () => {
    it('should throw error when email is empty', async () => {
      const { sut } = makeSut();

      const invalidInput: CreateAccountDto = {
        email: '',
        password: 'invalid_password',
      };

      const httpResponse = sut.execute(invalidInput);

      await expect(httpResponse).rejects.toThrow(Error('Email is required'));
    });

    it('should throw error when missing param email', async () => {
      const { sut } = makeSut();

      const invalidInput = {
        password: 'valid_password',
      };

      const httpResponse = sut.execute(invalidInput as CreateAccountDto);

      await expect(httpResponse).rejects.toThrow(Error('Missing param error'));
    });

    it('should throw error when password is empty', async () => {
      const { sut } = makeSut();

      const invalidInput: CreateAccountDto = {
        email: 'invalid_email',
        password: '',
      };

      const httpResponse = sut.execute(invalidInput);

      await expect(httpResponse).rejects.toThrow(Error('Password is required'));
    });

    it('should throw error when missing param password', async () => {
      const { sut } = makeSut();

      const invalidInput = {
        email: 'valid_email',
      };

      const httpResponse = sut.execute(invalidInput as CreateAccountDto);

      await expect(httpResponse).rejects.toThrow(Error('Missing param error'));
    });

    it('should throw error when email format is invalid', async () => {
      const { sut } = makeSut();

      const invalidInput: CreateAccountDto = {
        email: 'invalid_email',
        password: 'valid_password',
      };

      const httpResponse = sut.execute(invalidInput);

      await expect(httpResponse).rejects.toThrow(Error('Invalid email format'));
    });

    it('should throw error when password is too short', async () => {
      const { sut } = makeSut();

      const invalidInput: CreateAccountDto = {
        email: 'valid_email@mail.com',
        password: '123',
      };

      const httpResponse = sut.execute(invalidInput);

      await expect(httpResponse).rejects.toThrow(
        Error('Password must be at least 6 characters long'),
      );
    });
  });

  describe('Business Logic', () => {
    it('should throw error when user already exists', async () => {
      const { sut, userRepositoryStub } = makeSut();

      const existingUser = User.create({
        id: 'existing_id',
        email: 'existing_email@mail.com',
        password: 'hashed_password',
      });

      jest
        .spyOn(userRepositoryStub, 'findByEmail')
        .mockResolvedValue(existingUser);

      const validInput: CreateAccountDto = {
        email: 'existing_email@mail.com',
        password: 'valid_password',
      };

      const httpResponse = sut.execute(validInput);

      await expect(httpResponse).rejects.toThrow(Error('User already exists'));
    });

    it('should call passwordHasher with correct password', async () => {
      const { sut, passwordHasherStub } = makeSut();

      const hashSpy = jest.spyOn(passwordHasherStub, 'hash');

      const validInput: CreateAccountDto = {
        email: 'valid_email@mail.com',
        password: 'valid_password',
      };

      await sut.execute(validInput);

      expect(hashSpy).toHaveBeenCalledWith('valid_password');
    });
  });
});
