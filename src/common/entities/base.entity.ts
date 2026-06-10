import { randomUUID } from 'node:crypto';

/**
 * Common fields shared by every domain entity. When a real ORM is wired
 * in (e.g. TypeORM/Prisma) these become decorated columns; for now they
 * provide a consistent identity + audit shape across the in-memory stores.
 */
export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this.id = randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /** Refresh the `updatedAt` audit timestamp after a mutation. */
  touch(): void {
    this.updatedAt = new Date();
  }
}
