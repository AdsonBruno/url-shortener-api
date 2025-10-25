import { CreateAccountUseCase } from './create-account.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { IUserRepository } from 'src/account/domain/repositories/user.repository';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { User } from 'src/account/domain/entities/user.entity';
import { IIdGenerator } from '../ports/id-generator.interface';

describe('CreateAccountUseCase', () => {
  class UserRepositoryStub implements IUserRepository {
    findByEmail(_: string): Promise<User | null> {
      throw new Error('Method not implemented.');
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
  });
});
