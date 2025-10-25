import { Injectable, Inject } from '@nestjs/common';
import { IPasswordHasher } from '../../application/ports/password-hasher.interface';
import { ICryptoLibrary } from '../../application/ports/crypto-library.interface';
import { CRYPTO_LIBRARY } from '../../tokens';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  constructor(
    @Inject(CRYPTO_LIBRARY) private readonly cryptoLibrary: ICryptoLibrary,
  ) {}

  async hash(password: string): Promise<string> {
    return this.cryptoLibrary.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return this.cryptoLibrary.compare(password, hashedPassword);
  }
}
