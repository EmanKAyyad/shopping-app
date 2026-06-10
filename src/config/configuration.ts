/**
 * Centralised, typed application configuration.
 *
 * Values are read from environment variables (already validated by
 * `env.validation.ts`) and exposed as a single nested object so that
 * the rest of the app never touches `process.env` directly.
 */
export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  swaggerEnabled: boolean;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
}

export default (): Configuration => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
    swaggerEnabled: (process.env.SWAGGER_ENABLED ?? 'true') === 'true',
    corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    name: process.env.DATABASE_NAME ?? 'shopping',
  },
});
