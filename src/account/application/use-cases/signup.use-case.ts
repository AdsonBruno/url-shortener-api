import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { IIdGenerator } from '../ports/id-generator.interface';

export class CreateAccountUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(input: CreateAccountDto): Promise<User> {
    if (!input.email || input.email.trim() === '') {
      throw new Error('Email is required');
    }

    if (!input.password || input.password.trim() === '') {
      throw new Error('Password is required');
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
