import { Module } from '@nestjs/common';
import { AccountController } from './presentation/http/account.controller';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case';
import { InMemoryUserRepository } from './infrastructure/persistence/in-memory-user.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';
import { CryptoIdGeneratorService } from './infrastructure/services/crypto-id-generator.service';
import { BcryptCryptoLibraryAdapter } from './infrastructure/adapters/bcrypt-crypto-library.adapter';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  ID_GENERATOR,
  CRYPTO_LIBRARY,
} from './tokens';

@Module({
  imports: [],
  controllers: [AccountController],
  providers: [
    CreateAccountUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: ID_GENERATOR,
      useClass: CryptoIdGeneratorService,
    },
    {
      provide: CRYPTO_LIBRARY,
      useClass: BcryptCryptoLibraryAdapter,
    },
  ],
  exports: [],
})
export class AccountModule {}
