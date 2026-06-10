import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';

/**
 * Order placement, checkout & history.
 *
 * Placeholder module — depends on `ProductsModule` for stock/pricing.
 * Build out `dto/`, `orders.service.ts`, `orders.controller.ts`, and an
 * order state machine (pending → paid → fulfilled → cancelled).
 */
@Module({
  imports: [ProductsModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class OrdersModule {}
