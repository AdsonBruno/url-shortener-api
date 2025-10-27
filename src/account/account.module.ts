import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './presentation/http/account.controller';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case';
import { UserTypeOrmRepository } from './infrastructure/persistence/typeorm/repositories/user-typeorm.repository';
import { UserSchema } from './infrastructure/persistence/typeorm/schemas/user.schema';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service';
import { CryptoIdGeneratorService } from './infrastructure/services/crypto-id-generator.service';
import { BcryptCryptoLibraryAdapter } from './infrastructure/adapters/bcrypt-crypto-library.adapter';
import { NodeCryptoUuidLibraryAdapter } from './infrastructure/adapters/node-crypto-uuid-library.adapter';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  ID_GENERATOR,
  CRYPTO_LIBRARY,
  UUID_LIBRARY,
} from './tokens';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  controllers: [AccountController],
  providers: [
    CreateAccountUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
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
    {
      provide: UUID_LIBRARY,
      useClass: NodeCryptoUuidLibraryAdapter,
    },
  ],
  exports: [],
})
export class AccountModule {}
