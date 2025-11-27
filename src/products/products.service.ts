import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { Between, Like, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersService: UsersService,
  ) {}
  /**
   * Create a new product
   *@param dto data for creating new product
   @param userId  id of the logged user (Admin)
   @returns The created product from the database
   */
  async createProduct(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    const user = await this.usersService.getCurrentUser(userId);
    const newProduct = this.productRepository.create({
      ...createProductDto,
      title: createProductDto.title.toLowerCase(),
      user,
    });
    return this.productRepository.save(newProduct);
  }

  /**
   * Get all products
   */
  getProducts(
    title?: string,
    minPrice?: string,
    maxPrice?: string,
  ): Promise<Product[]> {
    const filters = {
      ...(title ? { title: Like(`%${title.toLowerCase()}%`) } : {}),
      ...(minPrice && maxPrice
        ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) }
        : {}),
    };
    return this.productRepository.find({ where: filters });
  }

  /**
   * Get a product by id
   */
  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Update a product by id
   */
  async updateProductById(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.getProductById(id);
    product.title = updateProductDto.title ?? product.title;
    product.price = updateProductDto.price ?? product.price;
    product.description = updateProductDto.description ?? product.description;
    await this.productRepository.save(product);
    return product;
  }

  /**
   * Delete a product by id
   */
  async deleteProductById(id: number): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
  }
}
