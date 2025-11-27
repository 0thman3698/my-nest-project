import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { Body } from '@nestjs/common';
import { Product } from './product.entity';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  // POST /api/products
  @Post()
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() payload: JWTPayloadType,
  ): Promise<Product> {
    return this.productsService.createProduct(createProductDto, payload.id);
  }
  // GET /api/products
  @Get()
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  getProducts(
    @Query('title') title: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ): Promise<Product[]> {
    return this.productsService.getProducts(title, minPrice, maxPrice);
  }
  // GET /api/products/:id
  @Get(':id')
  @SkipThrottle()
  getProductById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.getProductById(id);
  }
  // PUT /api/products/:id
  @Put(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  updateProductById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateProductById(id, updateProductDto);
  }
  // DELETE /api/products/:id
  @Delete(':id')
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  @ApiSecurity('bearer')
  deleteProductById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.deleteProductById(id);
  }
}
