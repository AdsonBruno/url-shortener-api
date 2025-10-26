import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserTypeOrmRepository } from './user-typeorm.repository';
import { UserSchema } from '../schemas/user.schema';
import { User } from '../../../../domain/entities/user.entity';

describe('UserTypeOrmRepository Integration Tests', () => {
  let repository: UserTypeOrmRepository;
  let typeOrmRepo: Repository<UserSchema>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserSchema],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([UserSchema]),
      ],
      providers: [UserTypeOrmRepository],
    }).compile();

    repository = module.get<UserTypeOrmRepository>(UserTypeOrmRepository);
    typeOrmRepo = module.get<Repository<UserSchema>>(
      getRepositoryToken(UserSchema),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await typeOrmRepo.clear();
  });

  describe('save', () => {
    it('should save user to database', async () => {
      const user = User.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      await repository.save(user);

      const savedUser = await typeOrmRepo.findOne({
        where: { id: 'test-user-id' },
      });

      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBe('test-user-id');
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.password).toBe('hashed-password');
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.deletedAt).toBeNull();
    });

    it('should update existing user when saving with same id', async () => {
      const user = User.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      await repository.save(user);

      const updatedUser = User.hydrate({
        ...user.props,
        password: 'new-hashed-password',
      });

      await repository.save(updatedUser);

      const savedUser = await typeOrmRepo.findOne({
        where: { id: 'test-user-id' },
      });

      expect(savedUser.password).toBe('new-hashed-password');

      const allUsers = await typeOrmRepo.find();
      expect(allUsers).toHaveLength(1);
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      const user = User.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      await repository.save(user);

      const foundUser = await repository.findByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe('test-user-id');
      expect(foundUser.email).toBe('test@example.com');
      expect(foundUser.password).toBe('hashed-password');
    });

    it('should return null when email does not exist', async () => {
      const foundUser = await repository.findByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });

    it('should be case sensitive for email', async () => {
      const user = User.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      await repository.save(user);

      const foundUser = await repository.findByEmail('TEST@EXAMPLE.COM');

      expect(foundUser).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when id exists', async () => {
      const user = User.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      await repository.save(user);

      const foundUser = await repository.findById('test-user-id');

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe('test-user-id');
      expect(foundUser.email).toBe('test@example.com');
      expect(foundUser.password).toBe('hashed-password');
    });

    it('should return null when id does not exist', async () => {
      const foundUser = await repository.findById('nonexistent-id');

      expect(foundUser).toBeNull();
    });
  });

  describe('soft delete support', () => {
    it('should not return soft deleted users in findByEmail', async () => {
      const userSchema = typeOrmRepo.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });

      await typeOrmRepo.save(userSchema);

      const foundUser = await repository.findByEmail('test@example.com');

      expect(foundUser).toBeNull();
    });

    it('should not return soft deleted users in findById', async () => {
      const userSchema = typeOrmRepo.create({
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      });

      await typeOrmRepo.save(userSchema);

      const foundUser = await repository.findById('test-user-id');

      expect(foundUser).toBeNull();
    });
  });
});
