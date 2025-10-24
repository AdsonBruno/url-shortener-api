import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IIdGenerator } from '../../application/ports/id-generator.interface';

@Injectable()
export class CryptoIdGeneratorService implements IIdGenerator {
  generate(): string {
    return randomUUID();
  }
}
