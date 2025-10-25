import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IIdGenerator } from '../../application/ports/id-generator.interface';

@Injectable()
export class CryptoIdGeneratorService implements IIdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
