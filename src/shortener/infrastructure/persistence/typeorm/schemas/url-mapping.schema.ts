import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('url_mappings')
export class UrlMappingSchema {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortUrlKey: string;

  @Column({ length: 30, nullable: true, unique: true })
  customAlias: string | null;

  @Column({ default: false })
  isCustomAlias: boolean;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ default: 0 })
  accessCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
