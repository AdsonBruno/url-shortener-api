import { Injectable, Inject } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { IUserRepository } from '../../../account/domain/repositories/user.repository';
import { IPasswordHasher } from '../../../account/application/ports/password-hasher.interface';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../../account/tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
    if (!loginDto.email || loginDto.email.trim() === '') {
      throw new Error('Email is required');
    }

    if (!loginDto.password || loginDto.password.trim() === '') {
      throw new Error('Password is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginDto.email)) {
      throw new Error('Invalid email format');
    }

    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
