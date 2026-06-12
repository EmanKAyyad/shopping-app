import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Common fields shared by every domain entity. When a real ORM is wired
 * in (e.g. TypeORM/Prisma) these become decorated columns; for now they
 * provide a consistent identity + audit shape across the in-memory stores.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /** Refresh the `updatedAt` audit timestamp after a mutation. */
  touch(): void {
    this.updatedAt = new Date();
  }
}
