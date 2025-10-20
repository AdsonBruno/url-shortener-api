import { Module } from '@nestjs/common';
import { CreateShortUrlUseCase } from './application/use-cases/create-short-url.use-case';
import { ID_GENERATOR } from './application/ports/id-generator.interface';
import { CryptoIdGeneratorService } from './infrastructure/services/crypto-id-generator.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    CreateShortUrlUseCase,
    {
      provide: ID_GENERATOR,
      useClass: CryptoIdGeneratorService,
    },
  ],
})
export class ShortnerModule {}
