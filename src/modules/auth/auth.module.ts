import { Module } from '@nestjs/common';

/**
 * Authentication & authorization (login, JWT, guards).
 *
 * Placeholder module — wire in `@nestjs/jwt` + `@nestjs/passport`, add
 * `dto/`, `strategies/`, `guards/`, then provide a global `JwtAuthGuard`
 * that respects the `@Public()` decorator from `common/decorators`.
 */
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuthModule {}
