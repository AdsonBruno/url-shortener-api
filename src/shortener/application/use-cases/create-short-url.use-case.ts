import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UrlMapping } from '../../domain/entities/url-mapping.entity';
import { URL_MAPPING_REPOSITORY } from '../../domain/repositories/url-mapping.repository';
import type { IUrlMappingRepository } from '../../domain/repositories/url-mapping.repository';
import { CreateShortUrlDto } from '../dtos/create-short-url.dto';

@Injectable()
export class CreateShortUrlUseCase {
  constructor(
    @Inject(URL_MAPPING_REPOSITORY)
    private readonly urlMappingRepository: IUrlMappingRepository,
  ) {}

  async execute(dto: CreateShortUrlDto): Promise<UrlMapping> {
    const slug = this.generateRandomSlug();

    const entityId = randomUUID();

    const urlMapping = UrlMapping.create({
      id: entityId,
      originalUrl: dto.originalUrl,
      shortUrlKey: slug,
      userId: dto.userId ?? null,
    });

    await this.urlMappingRepository.save(urlMapping);

    return urlMapping;
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
