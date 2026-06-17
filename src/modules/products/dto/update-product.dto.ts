import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

/**
 * All `CreateProductDto` fields become optional. `PartialType` from
 * @nestjs/swagger preserves both the validation rules and the API docs.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsInt()
  @IsNotEmpty()
  version: number;
}
