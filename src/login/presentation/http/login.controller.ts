import { Body, Controller, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { LoginResponseDto } from '../../application/dtos/login-response.dto';
import { HttpResponse } from '../../../account/presentation/http/http-response.interface';

@Controller('login')
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<HttpResponse<LoginResponseDto | { message: string }>> {
    try {
      const result = await this.loginUseCase.execute(loginDto);

      return {
        statusCode: HttpStatus.OK,
        body: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'Invalid credentials') {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          body: { message: 'Invalid credentials' },
        };
      }

      if (
        errorMessage === 'Email is required' ||
        errorMessage === 'Password is required' ||
        errorMessage === 'Invalid email format'
      ) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          body: { message: errorMessage },
        };
      }

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: { message: 'Internal server error' },
      };
    }
  }
}
