import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProductDto } from './dtos/update-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { Between, Like, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const saved = this.productRepository.save(newProduct);

    await this.invalidateProductKeys();
    return saved;
  }

  /**
   * Get all products
   */
  async getProducts(
    title?: string,
    minPrice?: string,
    maxPrice?: string,
  ): Promise<Product[]> {
    const key = this.makeKey(title?.toLowerCase(), minPrice, maxPrice);
    const cached = await this.cacheManager.get<Product[]>(key);
    if (cached) return cached;

    const filters = {
      ...(title ? { title: Like(`%${title.toLowerCase()}%`) } : {}),
      ...(minPrice && maxPrice
        ? { price: Between(parseInt(minPrice), parseInt(maxPrice)) }
        : {}),
    };
    const products = await this.productRepository.find({ where: filters });
    await this.cacheManager.set(key, products);
    return products;
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
    Object.assign(product, updateProductDto);

    const updated = await this.productRepository.save(product);
    await this.invalidateProductKeys();
    return updated;
  }

  /**
   * Delete a product by id
   */
  async deleteProductById(id: number): Promise<void> {
    const product = await this.getProductById(id);
    await this.productRepository.remove(product);
    await this.invalidateProductKeys();
    return;
  }

  private makeKey(title?: string, minPrice?: string, maxPrice?: string) {
    return `products:${title ?? 'all'}:${minPrice ?? ''}:${maxPrice ?? ''}`;
  }

  private async invalidateProductKeys(): Promise<void> {
    // NOTE: using `keys` can block Redis in production — replace with a tagging strategy or sets in prod.
    const store: any = (this.cacheManager as any).store;
    const client = store?.getClient?.() ?? store; // ioredis client
    if (!client) return;

    // Get keys matching products:* and delete them
    const keys = await client.keys('products:*');
    if (keys.length) await client.del(...keys);
  }
}
