import { Inject, Injectable } from '@nestjs/common';
import { URL_MAPPING_REPOSITORY } from '../../domain/repositories/url-mapping.repository';
import type { IUrlMappingRepository } from '../../domain/repositories/url-mapping.repository';
import { NotFoundException } from '../exceptions/not-found.exception';

@Injectable()
export class RedirectToOriginalUrlUseCase {
  constructor(
    @Inject(URL_MAPPING_REPOSITORY)
    private readonly urlMappingRepository: IUrlMappingRepository,
  ) {}

  async execute(shortUrlKey: string): Promise<string> {
    const urlMapping =
      await this.urlMappingRepository.findBySlugOrAlias(shortUrlKey);

    if (!urlMapping || urlMapping.props.deletedAt) {
      throw new NotFoundException('Short URL not found');
    }

    const updatedMapping = urlMapping.incrementAccessCount();
    await this.urlMappingRepository.save(updatedMapping);

    return urlMapping.props.originalUrl;
  }
}
