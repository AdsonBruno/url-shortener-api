import { Module } from '@nestjs/common';
import { CreateShortUrlUseCase } from './application/use-cases/create-short-url.use-case';
import { ID_GENERATOR } from './application/ports/id-generator.interface';
import { CryptoIdGeneratorService } from './infrastructure/services/crypto-id-generator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlMappingSchema } from './infrastructure/persistence/typeorm/schemas/url-mapping.schema';
import { URL_MAPPING_REPOSITORY } from './domain/repositories/url-mapping.repository';
import { UrlMappingTypeOrmRepository } from './infrastructure/persistence/typeorm/repositories/url-mapping-typeorm.repository';
import { ShortenerController } from './presentation/http/shortner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UrlMappingSchema])],
  controllers: [ShortenerController],
  providers: [
    CreateShortUrlUseCase,
    {
      provide: ID_GENERATOR,
      useClass: CryptoIdGeneratorService,
    },
    {
      provide: URL_MAPPING_REPOSITORY,
      useClass: UrlMappingTypeOrmRepository,
    },
  ],
})
export class ShortenerModule {}
