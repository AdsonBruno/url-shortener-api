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

  describe('Short URL key generation', () => {
    it('should generate a shgort URL key with 6 characters', async () => {
      const { sut } = makeSut();

      const result = await sut.execute(validInput);

      expect(result.props.shortUrlKey).toHaveLength(6);
    });

    it('should generate different short URL keys for multiple executions', async () => {
      const { sut } = makeSut();

      const result1 = await sut.execute(validInput);
      const result2 = await sut.execute(validInput);

      expect(result1.props.shortUrlKey).not.toBe(result2.props.shortUrlKey);
    });

    it('should generate short URL key with alphanumeric characters', async () => {
      const { sut } = makeSut();
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;

      const result = await sut.execute(validInput);

      expect(result.props.shortUrlKey).toMatch(alphanumericRegex);
    });
  });

  describe('Repository interaction', () => {
    it('should call repository save method', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const saveSpy = jest.spyOn(urlMappingRepositoryStub, 'save');

      await sut.execute(validInput);

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should call repository save with created URL mapping', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const saveSpy = jest.spyOn(urlMappingRepositoryStub, 'save');

      const result = await sut.execute(validInput);

      expect(saveSpy).toHaveBeenCalledWith(result);
    });
  });

  describe('ID Generator interaction', () => {
    it('should call ID generator to create entity ID', async () => {
      const { sut, idGeneratorStub } = makeSut();
      const generateSpy = jest.spyOn(idGeneratorStub, 'generate');

      await sut.execute(validInput);

      expect(generateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
