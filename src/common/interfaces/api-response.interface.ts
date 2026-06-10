/**
 * Canonical shape every successful HTTP response is wrapped in by the
 * global `TransformInterceptor`. Keeping a single envelope makes clients
 * predictable and lets us evolve metadata without touching controllers.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
  path: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
