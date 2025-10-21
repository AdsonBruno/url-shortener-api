import { UrlMapping } from '../../domain/entities/url-mapping.entity';
import type { IUrlMappingRepository } from '../../domain/repositories/url-mapping.repository';
import { IIdGenerator } from '../ports/id-generator.interface';
import { CreateShortUrlUseCase } from './create-short-url.use-case';

class UrlMappingRepositoryStub implements IUrlMappingRepository {
  async save(urlMapping: UrlMapping): Promise<void> {
    return Promise.resolve();
  }

  async findByShortUrlKey(_key: string): Promise<UrlMapping | null> {
    return Promise.resolve<UrlMapping | null>(null);
  }

  async findById(_id: string): Promise<UrlMapping | null> {
    return Promise.resolve<UrlMapping | null>(null);
  }

  async findAllByUserId(_userId: string): Promise<UrlMapping[]> {
    return Promise.resolve<UrlMapping[]>([]);
  }
}

class IdGeneratorStub implements IIdGenerator {
  generate(): string {
    return 'valid-uuid';
  }
}

interface SutTypes {
  sut: CreateShortUrlUseCase;
  urlMappingRepositoryStub: IUrlMappingRepository;
  idGeneratorStub: IIdGenerator;
}

const makeSut = (): SutTypes => {
  const urlMappingRepositoryStub = new UrlMappingRepositoryStub();
  const idGeneratorStub = new IdGeneratorStub();

  const sut = new CreateShortUrlUseCase(
    urlMappingRepositoryStub,
    idGeneratorStub,
  );

  return {
    sut,
    urlMappingRepositoryStub,
    idGeneratorStub,
  };
};

describe('CreateShortUrlUseCase', () => {
  const validInput = {
    originalUrl: 'https://example.com/',
    userId: 'valid-user-id',
  };

  it('should be defined', () => {
    const { sut } = makeSut();

    expect(sut).toBeDefined();
  });

  describe('URL mapping creation', () => {
    it('should return a UrlMapping instance', async () => {
      const { sut } = makeSut();

      const result = await sut.execute(validInput);

      expect(result).toBeInstanceOf(UrlMapping);
    });

    it('should create URL mapping with correct original URL', async () => {
      const { sut } = makeSut();

      const result = await sut.execute(validInput);

      expect(result.props.originalUrl).toBe(validInput.originalUrl);
    });

    it('should create URL mapping with generated ID', async () => {
      const { sut } = makeSut();

      const result = await sut.execute(validInput);

      expect(result.props.id).toBe('valid-uuid');
    });

    it('should create URL mapping with correct user ID', async () => {
      const { sut } = makeSut();

      const result = await sut.execute(validInput);

      expect(result.props.userId).toBe(validInput.userId);
    });

    it('should create URL mapping with null user ID when not provided', async () => {
      const { sut } = makeSut();
      const inputWithoutUserId = { originalUrl: 'https://example.com/' };

      const result = await sut.execute(inputWithoutUserId);

      expect(result.props.userId).toBeNull();
    });
  });
});
