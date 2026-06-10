import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Aeron Chair' })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty({ example: 'Ergonomic office chair' })
  @IsString()
  @Length(0, 2000)
  description: string;

  @ApiProperty({ example: 119900, description: 'Price in minor units (cents)' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency = 'USD';

  @ApiProperty({ example: 'CHR-AERON-001' })
  @IsString()
  @Length(1, 64)
  sku: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ required: false, nullable: true })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
