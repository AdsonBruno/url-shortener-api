import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlMapping } from '../../../../domain/entities/url-mapping.entity';
import { IUrlMappingRepository } from '../../../../domain/repositories/url-mapping.repository';
import { UrlMappingSchema } from '../schemas/url-mapping.schema';

@Injectable()
export class UrlMappingTypeOrmRepository implements IUrlMappingRepository {
  constructor(
    @InjectRepository(UrlMappingSchema)
    private readonly typeOrmRepo: Repository<UrlMappingSchema>,
  ) {}

  async save(urlMapping: UrlMapping): Promise<void> {
    const schema = this.typeOrmRepo.create(urlMapping.props);
    await this.typeOrmRepo.save(schema);
  }

  async findByShortUrlKey(shortUrlKey: string): Promise<UrlMapping | null> {
    const schema = await this.typeOrmRepo.findOne({ where: { shortUrlKey } });

    return schema ? UrlMapping.hydrate(schema) : null;
  }

  async findById(id: string): Promise<UrlMapping | null> {
    const schema = await this.typeOrmRepo.findOne({ where: { id } });

    return schema ? UrlMapping.hydrate(schema) : null;
  }

  async findAllByUserId(userId: string): Promise<UrlMapping[]> {
    const schemas = await this.typeOrmRepo.find({ where: { userId } });

    return schemas.map((schema) => UrlMapping.hydrate(schema));
  }
}
