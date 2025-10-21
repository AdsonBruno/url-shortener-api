import { Inject, Injectable } from '@nestjs/common';
import { UrlMapping } from '../../domain/entities/url-mapping.entity';
import { URL_MAPPING_REPOSITORY } from '../../domain/repositories/url-mapping.repository';
import type { IUrlMappingRepository } from '../../domain/repositories/url-mapping.repository';
import type { IIdGenerator } from '../ports/id-generator.interface';
import { ID_GENERATOR } from '../ports/id-generator.interface';
import { CreateShortUrlDto } from '../dtos/create-short-url.dto';
import { ValidationException } from '../exceptions/validation.exception';
import { ConflictException } from '../exceptions/conflict.exception';

@Injectable()
export class CreateShortUrlUseCase {
  constructor(
    @Inject(URL_MAPPING_REPOSITORY)
    private readonly urlMappingRepository: IUrlMappingRepository,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: CreateShortUrlDto): Promise<UrlMapping> {
    // Validação de entrada
    this.validateInput(dto);

    let slug: string;
    let attempts = 0;
    const maxAttempts = 10;

    // Gera slug único com tratamento de colisão
    do {
      if (attempts >= maxAttempts) {
        throw new ConflictException('Unable to generate unique short URL key');
      }

      slug = this.generateRandomSlug();
      const existingUrlMapping =
        await this.urlMappingRepository.findByShortUrlKey(slug);

      if (!existingUrlMapping) {
        break;
      }

      attempts++;
      // eslint-disable-next-line no-constant-condition
    } while (true);

    const entityId = this.idGenerator.generate();

    const urlMapping = UrlMapping.create({
      id: entityId,
      originalUrl: dto.originalUrl,
      shortUrlKey: slug,
      userId: dto.userId ?? null,
    });

    await this.urlMappingRepository.save(urlMapping);

    return urlMapping;
  }

  private validateInput(dto: CreateShortUrlDto): void {
    if (!dto.originalUrl || dto.originalUrl.trim() === '') {
      throw new ValidationException('Original URL is required');
    }

    try {
      new URL(dto.originalUrl);
    } catch {
      throw new ValidationException('Invalid URL format');
    }
  }

  private generateRandomSlug(length = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
