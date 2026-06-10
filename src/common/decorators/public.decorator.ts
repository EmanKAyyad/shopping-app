import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible, bypassing the (future) global
 * auth guard. Apply with `@Public()` on a controller or handler.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
