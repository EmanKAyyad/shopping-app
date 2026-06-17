import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('product')
export class Product extends BaseEntity {
  @ApiProperty()
  @Column()
  name: string;

  @Column()
  @ApiProperty()
  description: string;

  @ApiProperty({ description: 'Price in minor units (e.g. cents)' })
  @Column()
  price: number;

  @ApiProperty()
  @Column()
  stock: number;

  @ApiProperty({ nullable: true })
  @Column('uuid', { nullable: true })
  categoryId: string | null;

  @ApiProperty()
  @Column('uuid')
  createdById: string;

  @VersionColumn()
  version: number;

  constructor() {
    super();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
