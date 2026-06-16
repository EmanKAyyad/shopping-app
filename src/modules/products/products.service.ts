import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { ERROR_FETCHING_LIST } from '../../common/constants/error.const';
import { MAX_PRICE, MIN_PRICE } from '../../common/constants/filter.const';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
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

  async findAll(query: QueryProductDto) {
    const where = {};

    if (query.search?.trim()) {
      where['name'] = Like(`%${query.search ?? ''}%`);
    }

    if (query.minPrice && query.maxPrice) {
      where['price'] = Between(
        query.minPrice ?? MIN_PRICE,
        query.maxPrice ?? MAX_PRICE,
      );
    }

    if (query.categoryId) {
      where['categoryId'] = query.categoryId;
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      take: query.limit,
      skip: query.skip,
    });

    if (!products) {
      throw new NotFoundException(ERROR_FETCHING_LIST('products'));
    }

    const pageCount = Math.ceil(total / query.limit) || 1;

    return {
      items: products,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        pageCount,
        hasNextPage: query.page < pageCount,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  // async findOne(id: string): Promise<Product | null> {
  //   const product = await this.productRepository.findOneBy({ id });
  //   if (!product) {
  //     throw new NotFoundException(`Product "${id}" not found`);
  //   }
  //   return product;
  // }

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
