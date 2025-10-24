import { UrlMapping } from '../../domain/entities/url-mapping.entity';
import type { IUrlMappingRepository } from '../../domain/repositories/url-mapping.repository';
import { NotFoundException } from '../exceptions/not-found.exception';
import { RedirectToOriginalUrlUseCase } from './redirect-to-original-url.use-case';

class UrlMappingRepositoryStub implements IUrlMappingRepository {
  async save(_: UrlMapping): Promise<void> {
    return Promise.resolve();
  }

  async findByShortUrlKey(_: string): Promise<UrlMapping | null> {
    return Promise.resolve<UrlMapping | null>(null);
  }

  async findBySlugOrAlias(_: string): Promise<UrlMapping | null> {
    return Promise.resolve<UrlMapping | null>(null);
  }

  async findById(_: string): Promise<UrlMapping | null> {
    return Promise.resolve<UrlMapping | null>(null);
  }

  async findAllByUserId(_: string): Promise<UrlMapping[]> {
    return Promise.resolve<UrlMapping[]>([]);
  }
}

interface SutTypes {
  sut: RedirectToOriginalUrlUseCase;
  urlMappingRepositoryStub: IUrlMappingRepository;
}

const makeSut = (): SutTypes => {
  const urlMappingRepositoryStub = new UrlMappingRepositoryStub();
  const sut = new RedirectToOriginalUrlUseCase(urlMappingRepositoryStub);

  return {
    sut,
    urlMappingRepositoryStub,
  };
};

const makeValidUrlMapping = (): UrlMapping => {
  return UrlMapping.create({
    id: 'valid-id',
    originalUrl: 'https://example.com',
    shortUrlKey: 'abc123',
    customAlias: undefined,
    isCustomAlias: false,
    userId: null,
  });
};

describe('RedirectToOriginalUrlUseCase', () => {
  it('should be defined', () => {
    const { sut } = makeSut();
    expect(sut).toBeDefined();
  });

  describe('Successful redirection', () => {
    it('should return original URL when short URL key exists', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const urlMapping = makeValidUrlMapping();
      jest
        .spyOn(urlMappingRepositoryStub, 'findBySlugOrAlias')
        .mockResolvedValue(urlMapping);

      const result = await sut.execute('abc123');

      expect(result).toBe('https://example.com');
    });

    it('should increment access count', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const urlMapping = makeValidUrlMapping();
      jest
        .spyOn(urlMappingRepositoryStub, 'findBySlugOrAlias')
        .mockResolvedValue(urlMapping);

      const saveSpy = jest.spyOn(urlMappingRepositoryStub, 'save');

      await sut.execute('abc123');

      const savedUrlMapping = saveSpy.mock.calls[0][0];
      expect(savedUrlMapping.props.accessCount).toBe(1);
      expect(savedUrlMapping.props.accessCount).toBeGreaterThan(
        urlMapping.props.accessCount,
      );
    });

    it('should call repository save with updated mapping', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const urlMapping = makeValidUrlMapping();
      jest
        .spyOn(urlMappingRepositoryStub, 'findBySlugOrAlias')
        .mockResolvedValue(urlMapping);

      const saveSpy = jest.spyOn(urlMappingRepositoryStub, 'save');

      await sut.execute('abc123');

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('URL not found scenarios', () => {
    it('should throw NotFoundException when URL mapping does not exist', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      jest
        .spyOn(urlMappingRepositoryStub, 'findBySlugOrAlias')
        .mockResolvedValue(null);

      await expect(sut.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(sut.execute('nonexistent')).rejects.toThrow(
        'Short URL not found',
      );
    });

    it('should throw NotFoundException when URL mapping is soft deleted', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const deletedUrlMapping = makeValidUrlMapping().softDelete();
      jest
        .spyOn(urlMappingRepositoryStub, 'findBySlugOrAlias')
        .mockResolvedValue(deletedUrlMapping);

      await expect(sut.execute('abc123')).rejects.toThrow(NotFoundException);
      await expect(sut.execute('abc123')).rejects.toThrow(
        'Short URL not found',
      );
    });
  });

  describe('Repository interaction', () => {
    it('should call repository findBySlugOrAlias with correct parameter', async () => {
      const { sut, urlMappingRepositoryStub } = makeSut();
      const findSpy = jest
        .spyOn(urlMappingRepositoryStub, 'findBySlugOrAlias')
        .mockResolvedValue(makeValidUrlMapping());

      await sut.execute('test123');

      expect(findSpy).toHaveBeenCalledWith('test123');
    });
  });
});
