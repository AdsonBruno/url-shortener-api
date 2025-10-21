import { UrlMapping } from '../entities/url-mapping.entity';

export interface IUrlMappingRepository {
  save(urlMapping: UrlMapping): Promise<void>;

  findByShortUrlKey(shortUrlKey: string): Promise<UrlMapping | null>;

  findBySlugOrAlias(key: string): Promise<UrlMapping | null>;

  findById(id: string): Promise<UrlMapping | null>;

  findAllByUserId(userId: string): Promise<UrlMapping[]>;
}

export const URL_MAPPING_REPOSITORY = 'UrlMappingRepository';
