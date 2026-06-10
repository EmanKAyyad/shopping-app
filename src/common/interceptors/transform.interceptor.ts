import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Wraps every successful controller return value in the standard
 * `ApiResponse` envelope. If a handler already returns `{ items, meta }`
 * (a paginated payload) the `meta` is lifted onto the envelope.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((payload: T) => {
        const isPaginated =
          payload !== null &&
          typeof payload === 'object' &&
          'items' in payload &&
          'meta' in payload;

        return {
          success: true as const,
          data: isPaginated ? (payload as { items: T }).items : payload,
          meta: isPaginated
            ? (payload as { meta: Record<string, unknown> }).meta
            : undefined,
          path: request.url,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
