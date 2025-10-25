import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ICryptoLibrary } from '../../application/ports/crypto-library.interface';

@Injectable()
export class BcryptCryptoLibraryAdapter implements ICryptoLibrary {
  async hash(data: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(data, saltRounds);
  }

  async compare(data: string, hashedData: string): Promise<boolean> {
    return bcrypt.compare(data, hashedData);
  }
}
