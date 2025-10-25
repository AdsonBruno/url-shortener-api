import { Injectable, Inject } from '@nestjs/common';
import { IIdGenerator } from '../../application/ports/id-generator.interface';
import { IUuidLibrary } from '../../application/ports/uuid-library.interface';
import { UUID_LIBRARY } from '../../tokens';

@Injectable()
export class CryptoIdGeneratorService implements IIdGenerator {
  constructor(
    @Inject(UUID_LIBRARY) private readonly uuidLibrary: IUuidLibrary,
  ) {}

  generate(): string {
    return this.uuidLibrary.randomUUID();
  }
}
