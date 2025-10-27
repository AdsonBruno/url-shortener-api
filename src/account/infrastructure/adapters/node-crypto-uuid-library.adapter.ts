import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IUuidLibrary } from '../../application/ports/uuid-library.interface';

@Injectable()
export class NodeCryptoUuidLibraryAdapter implements IUuidLibrary {
  randomUUID(): string {
    return crypto.randomUUID();
  }
}
