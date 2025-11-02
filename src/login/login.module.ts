import { Module } from '@nestjs/common';
import { LoginController } from './presentation/http/login.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [LoginController],
  providers: [LoginUseCase],
  exports: [],
})
export class LoginModule {}
