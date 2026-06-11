import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class Product extends BaseEntity {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ description: 'Price in minor units (e.g. cents)' })
  price: number;

  @ApiProperty()
  stock: number;

  @ApiProperty({ nullable: true })
  categoryId: string | null;

  constructor(partial: Partial<Product>) {
    super();
    Object.assign(this, partial);
  }
}
