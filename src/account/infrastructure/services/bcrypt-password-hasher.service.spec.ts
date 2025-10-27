import { BcryptPasswordHasher } from './bcrypt-password-hasher.service';
import { BcryptCryptoLibraryAdapter } from '../adapters/bcrypt-crypto-library.adapter';

describe('BcryptPasswordHasher', () => {
  let passwordHasher: BcryptPasswordHasher;

  beforeEach(() => {
    const cryptoLibrary = new BcryptCryptoLibraryAdapter();
    passwordHasher = new BcryptPasswordHasher(cryptoLibrary);
  });

  it('should hash password and return different value than original', async () => {
    const originalPassword = 'myPassword123';

    const hashedPassword = await passwordHasher.hash(originalPassword);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(originalPassword);
    expect(hashedPassword.length).toBeGreaterThan(originalPassword.length);
    expect(hashedPassword).toMatch(/^\$2[aby]\$/);
  });
});
