import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../domain/entities/user.entity';
import { IUserRepository } from '../../../../domain/repositories/user.repository';
import { UserSchema } from '../schemas/user.schema';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly typeOrmRepo: Repository<UserSchema>,
  ) {}

  async save(user: User): Promise<void> {
    const schema = this.typeOrmRepo.create(user.props);
    await this.typeOrmRepo.save(schema);
  }

  async findByEmail(email: string): Promise<User | null> {
    const schema = await this.typeOrmRepo.findOne({
      where: { email, deletedAt: null },
    });

    return schema ? User.hydrate(schema) : null;
  }

  async findById(id: string): Promise<User | null> {
    const schema = await this.typeOrmRepo.findOne({
      where: { id, deletedAt: null },
    });

    return schema ? User.hydrate(schema) : null;
  }
}
