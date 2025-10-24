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
    this.validateInput(dto);

    let shortUrlKey: string;
    let isCustomAlias = false;

    if (dto.customAlias) {
      this.validateCustomAlias(dto.customAlias);
      this.validateReservedRoutes(dto.customAlias);
      await this.validateAliasUniqueness(dto.customAlias);

      shortUrlKey = dto.customAlias.toLowerCase();
      isCustomAlias = true;
    } else {
      shortUrlKey = await this.generateUniqueSlug();
      isCustomAlias = false;
    }

    const entityId = this.idGenerator.generate();

    const urlMapping = UrlMapping.create({
      id: entityId,
      originalUrl: dto.originalUrl,
      shortUrlKey: isCustomAlias ? this.generateRandomSlug() : shortUrlKey,
      customAlias: isCustomAlias ? shortUrlKey : undefined,
      isCustomAlias,
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

  private validateCustomAlias(alias: string): void {
    if (alias.length < 3 || alias.length > 30) {
      throw new ValidationException(
        'Alias must be between 3 and 30 characters',
      );
    }

    const aliasRegex = /^[a-z0-9_-]+$/i;
    if (!aliasRegex.test(alias)) {
      throw new ValidationException(
        'Alias can only contain letters, numbers, hyphens, and underscores',
      );
    }
  }

  private validateReservedRoutes(alias: string): void {
    const reservedRoutes = [
      'auth',
      'docs',
      'api',
      'shorten',
      'my-urls',
      'admin',
      'health',
      'metrics',
    ];

    if (reservedRoutes.includes(alias.toLowerCase())) {
      throw new ValidationException(
        'Alias conflicts with reserved system route',
      );
    }
  }

  private async validateAliasUniqueness(alias: string): Promise<void> {
    const existingMapping = await this.urlMappingRepository.findBySlugOrAlias(
      alias.toLowerCase(),
    );

    if (existingMapping) {
      throw new ConflictException('Alias already exists');
    }
  }

  private async generateUniqueSlug(): Promise<string> {
    let slug: string;
    let attempts = 0;
    const maxAttempts = 10;

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

    return slug;
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
