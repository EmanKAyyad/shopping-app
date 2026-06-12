import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

/**
 * Business logic for products.
 *
 * Backed by an in-memory `Map` so the project runs with no database.
 * Swap the store for an injected repository (TypeORM/Prisma) without
 * changing the controller or the public method signatures.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  // findAll(query: QueryProductDto): Paginated<Product> {
  //   let items = [...this.products.values()];

  //   if (query.search) {
  //     const term = query.search.toLowerCase();
  //     items = items.filter(
  //       (p) =>
  //         p.name.toLowerCase().includes(term) ||
  //         p.description.toLowerCase().includes(term),
  //     );
  //   }
  //   if (query.categoryId) {
  //     items = items.filter((p) => p.categoryId === query.categoryId);
  //   }
  //   if (query.minPrice !== undefined) {
  //     items = items.filter((p) => p.price >= query.minPrice!);
  //   }
  //   if (query.maxPrice !== undefined) {
  //     items = items.filter((p) => p.price <= query.maxPrice!);
  //   }

  //   const total = items.length;
  //   const paged = items.slice(query.skip, query.skip + query.limit);
  //   const pageCount = Math.ceil(total / query.limit) || 1;

  //   return {
  //     items: paged,
  //     meta: {
  //       total,
  //       page: query.page,
  //       limit: query.limit,
  //       pageCount,
  //       hasNextPage: query.page < pageCount,
  //       hasPreviousPage: query.page > 1,
  //     },
  //   };
  // }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product "${id}" not found`);
    }
    return product;
  }

  // update(id: string, dto: UpdateProductDto): Product {
  //   const product = this.findOne(id);
  //   Object.assign(product, dto);
  //   product.touch();
  //   this.products.set(id, product);
  //   return product;
  // }

  // remove(id: string): void {
  //   if (!this.products.delete(id)) {
  //     throw new NotFoundException(`Product "${id}" not found`);
  //   }
  // }
}
