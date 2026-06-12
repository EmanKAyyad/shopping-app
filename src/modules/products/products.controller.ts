import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ type: Product })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products (paginated & filterable)' })
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll();
  }

  // @Public()
  // @Get(':id')
  // @ApiOperation({ summary: 'Get a product by id' })
  // @ApiOkResponse({ type: Product })
  // findOne(@Param('id', ParseUUIDPipe) id: string): Product {
  //   return this.productsService.findOne(id);
  // }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update a product' })
  // @ApiOkResponse({ type: Product })
  // update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() dto: UpdateProductDto,
  // ): Product {
  //   return this.productsService.update(id, dto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({ summary: 'Delete a product' })
  // remove(@Param('id', ParseUUIDPipe) id: string): void {
  //   this.productsService.remove(id);
  // }
}
