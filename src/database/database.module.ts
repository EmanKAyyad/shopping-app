import { Global, Module } from '@nestjs/common';

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
  imports: [],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
