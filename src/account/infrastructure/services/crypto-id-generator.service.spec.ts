import { CryptoIdGeneratorService } from './crypto-id-generator.service';
import { NodeCryptoUuidLibraryAdapter } from '../adapters/node-crypto-uuid-library.adapter';

describe('CryptoIdGeneratorService', () => {
  let idGenerator: CryptoIdGeneratorService;

  beforeEach(() => {
    const uuidLibrary = new NodeCryptoUuidLibraryAdapter();
    idGenerator = new CryptoIdGeneratorService(uuidLibrary);
  });

  it('should generate valid UUID format', () => {
    const generatedId = idGenerator.generate();

    expect(generatedId).toBeDefined();
    expect(typeof generatedId).toBe('string');
    expect(generatedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
