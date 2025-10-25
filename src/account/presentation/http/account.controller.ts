import { Body, Controller, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateAccountUseCase } from '../../application/use-cases/create-account.use-case';
import { CreateAccountDto } from '../../application/dtos/create-account.dto';
import { CreateAccountResponseDto } from '../../application/dtos/create-account-response.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly createAccountUseCase: CreateAccountUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<CreateAccountResponseDto> {
    try {
      const user = await this.createAccountUseCase.execute(createAccountDto);

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'User already exists') {
        throw new Error('User already exists');
      }
      if (
        errorMessage === 'Email is required' ||
        errorMessage === 'Password is required' ||
        errorMessage === 'Invalid email format' ||
        errorMessage === 'Password must be at least 6 characters long'
      ) {
        throw new Error(errorMessage);
      }
      throw new Error('Internal server error');
    }
  }
}
