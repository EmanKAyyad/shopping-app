import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';

/**
 * Shopping cart.
 *
 * Placeholder module — depends on `ProductsModule` to validate items and
 * read prices. Build out `dto/`, `cart.service.ts`, `cart.controller.ts`.
 */
@Module({
  imports: [ProductsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class CartModule {}
