import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { AppConfig } from './config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);
  const appConfig = config.getOrThrow<AppConfig>('app');

  // Global URL prefix, e.g. /api/v1/products
  app.setGlobalPrefix(appConfig.apiPrefix);

  // Strip/validate every incoming payload against its DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // drop unknown properties
      forbidNonWhitelisted: true, // 400 on unknown properties
      transform: true, // instantiate DTO classes & coerce types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Consistent success envelope + error envelope + request logging.
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // Allow graceful shutdown hooks (DB connections, queues, etc.).
  app.enableShutdownHooks();
  app.enableCors();

  if (appConfig.swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Shopping API')
      .setDescription('REST API for the shopping application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(appConfig.port);

  const logger = new Logger('Bootstrap');
  logger.log(
    `🚀 Application running on http://localhost:${appConfig.port}/${appConfig.apiPrefix}`,
  );
  if (appConfig.swaggerEnabled) {
    logger.log(`📚 Swagger docs at http://localhost:${appConfig.port}/docs`);
  }
}

void bootstrap();
