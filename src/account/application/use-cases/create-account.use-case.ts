import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { IIdGenerator } from '../ports/id-generator.interface';
import { USER_REPOSITORY, PASSWORD_HASHER, ID_GENERATOR } from '../../tokens';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
    @Inject(ID_GENERATOR) private readonly idGenerator: IIdGenerator,
  ) { }

  async execute(input: CreateAccountDto): Promise<User> {
    if (input.email === '') {
      throw new Error('Email is required');
    }

    if (!input.email) {
      throw new Error('Missing param error');
    }

    if (input.password === '') {
      throw new Error('Password is required');
    }

    if (!input.password) {
      throw new Error('Missing param error');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Invalid email format');
    }

    if (input.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: this.idGenerator.generate(),
      email: input.email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user;
  }
}
