import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../config';
import { Product } from '../modules/products/entities/product.entity';

/**
 * Central place to wire the persistence layer.
 *
 * It is intentionally empty today — the feature modules ship with
 * in-memory repositories so the app runs with zero external services.
 * When you adopt a real datastore, register it here (e.g.
 * `TypeOrmModule.forRootAsync(...)` / `PrismaModule`) and export the
 * connection so feature modules can inject repositories.
 *
 * Marked `@Global()` so the connection is available app-wide without
 * re-importing this module in every feature.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.name,
          entities: [Product],
          synchronize: true,
        };
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
