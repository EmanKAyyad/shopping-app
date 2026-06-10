import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductsService } from './products.service';

const buildDto = (
  overrides: Partial<CreateProductDto> = {},
): CreateProductDto => ({
  name: 'Test Product',
  description: 'A product used in tests',
  price: 1000,
  currency: 'USD',
  sku: `SKU-${Math.random().toString(36).slice(2, 8)}`,
  stock: 10,
  ...overrides,
});

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get(ProductsService);
  });

  it('creates and retrieves a product', () => {
    const created = service.create(buildDto({ sku: 'SKU-1' }));
    expect(created.id).toBeDefined();
    expect(service.findOne(created.id).sku).toBe('SKU-1');
  });

  it('rejects duplicate SKUs', () => {
    service.create(buildDto({ sku: 'DUP' }));
    expect(() => service.create(buildDto({ sku: 'DUP' }))).toThrow(
      ConflictException,
    );
  });

  it('throws when a product is missing', () => {
    expect(() =>
      service.findOne('00000000-0000-0000-0000-000000000000'),
    ).toThrow(NotFoundException);
  });

  it('paginates and reports accurate meta', () => {
    for (let i = 0; i < 25; i++) {
      service.create(buildDto({ sku: `PAGE-${i}` }));
    }
    const query = Object.assign(new QueryProductDto(), { page: 1, limit: 10 });
    const result = service.findAll(query);

    expect(result.items).toHaveLength(10);
    expect(result.meta.total).toBe(25);
    expect(result.meta.pageCount).toBe(3);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPreviousPage).toBe(false);
  });
});
