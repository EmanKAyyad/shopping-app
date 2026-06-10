import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';
import { AppModule } from './../src/app.module';

describe('Shopping API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as { data: { status: string } };
        expect(body.data.status).toBe('ok');
      });
  });

  it('GET /products returns a paginated envelope', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          success: boolean;
          data: unknown[];
          meta: Record<string, unknown>;
        };
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.meta).toHaveProperty('total');
      });
  });

  it('POST /products then GET /products/:id round-trips', async () => {
    const created = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'E2E Product',
        description: 'created during e2e',
        price: 2500,
        sku: 'E2E-001',
        stock: 5,
      })
      .expect(201);

    const { id } = (created.body as { data: { id: string } }).data;
    return request(app.getHttpServer())
      .get(`/products/${id}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { data: { sku: string } };
        expect(body.data.sku).toBe('E2E-001');
      });
  });
});
