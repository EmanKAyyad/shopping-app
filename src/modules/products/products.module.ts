import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Exported so other modules (e.g. cart, orders) can reuse product logic.
  exports: [ProductsService],
})
export class ProductsModule {}
