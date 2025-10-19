import { UrlMapping } from '../entities/url-mapping.entity';

export interface UrlMappingRepository {
  save(urlMapping: UrlMapping): Promise<void>;

  findByShortUrlKey(shortUrlKey: string): Promise<UrlMapping | null>;

  findById(id: string): Promise<UrlMapping | null>;

  findAllByUserId(userId: string): Promise<UrlMapping[]>;
}
