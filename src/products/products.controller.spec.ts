/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadType } from '../utils/types';
import { UserType } from '../utils/enums';
import { CreateProductDto } from './dtos/create-product.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dtos/update-product.dto';
type ProductTestType = { id: number; title: string; price: number };

describe('ProductsController', () => {
  let productsController: ProductsController;
  let productsService: ProductsService;
  const currentUser: JWTPayloadType = { id: 1, userType: UserType.ADMIN };
  const createProductDto: CreateProductDto = {
    title: 'book',
    description: 'about this book',
    price: 10,
  };

  let products: ProductTestType[];

  beforeEach(async () => {
    products = [
      { id: 1, title: 'book', price: 10 },
      { id: 2, title: 'laptop', price: 500 },
      { id: 3, title: 'carpet', price: 100 },
      { id: 4, title: 'chair', price: 20 },
    ];
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ConfigService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: JwtService, useValue: {} },
        {
          provide: ProductsService,
          useValue: {
            createProduct: jest.fn((dto: CreateProductDto, userId: number) =>
              Promise.resolve({ ...dto, id: 1 }),
            ),
            getProducts: jest.fn(
              (title?: string, minPrice?: number, maxPrice?: number) => {
                if (title)
                  return Promise.resolve(
                    products.filter((p) => p.title === title),
                  );
                if (minPrice && maxPrice)
                  return Promise.resolve(
                    products.filter(
                      (p) => p.price >= minPrice && p.price <= maxPrice,
                    ),
                  );
                return Promise.resolve(products);
              },
            ),
            getProductById: jest.fn((id: number) => {
              const product = products.find((p) => p.id === id);
              if (!product) throw new NotFoundException('Product not found');
              return Promise.resolve(product);
            }),
            updateProductById: jest.fn(
              (productId: number, dto: UpdateProductDto) =>
                Promise.resolve({ ...dto, id: productId }),
            ),
            deleteProductById: jest.fn((productId: number) =>
              Promise.resolve(undefined),
            ),
          },
        },
      ],
    }).compile();

    productsController = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should productsController be defined', () => {
    expect(productsController).toBeDefined();
  });

  it('should productsService be defined', () => {
    expect(productsService).toBeDefined();
  });

  // Create new product
  describe('createProduct()', () => {
    it("should call 'createProduct' method in productsService", async () => {
      await productsController.createProduct(createProductDto, currentUser);
      expect(productsService.createProduct).toHaveBeenCalled();
      expect(productsService.createProduct).toHaveBeenCalledTimes(1);
      expect(productsService.createProduct).toHaveBeenCalledWith(
        createProductDto,
        currentUser.id,
      );
    });

    it('should return new product with the givin data', async () => {
      const result = await productsController.createProduct(
        createProductDto,
        currentUser,
      );
      expect(result).toMatchObject(createProductDto);
      expect(result.id).toBe(1);
    });
  });

  // Get all products
  describe('getProducts()', () => {
    it("it should call 'getProducts' method in productsService", async () => {
      await productsController.getProducts(
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(productsService.getProducts).toHaveBeenCalled();
      expect(productsService.getProducts).toHaveBeenCalledTimes(1);
    });

    it('it should return all products if no argument passed', async () => {
      const data = await productsController.getProducts(
        undefined as any,
        undefined as any,
        undefined as any,
      );
      expect(data).toBe(products);
      expect(data).toHaveLength(4);
    });

    it('it should return products based on title', async () => {
      const data = await productsController.getProducts(
        'book' as any,
        undefined as any,
        undefined as any,
      );
      expect(data[0]).toMatchObject({ title: 'book' });
      expect(data).toHaveLength(1);
    });

    it('it should return products based on minPrice & maxPrice', async () => {
      const data = await productsController.getProducts(
        undefined as any,
        '80',
        '900',
      );
      expect(data).toHaveLength(2);
    });
  });

  // Get single product by id
  describe('getProductById()', () => {
    it("should call 'getProductById' method in productsService", async () => {
      await productsController.getProductById(2);
      expect(productsService.getProductById).toHaveBeenCalled();
      expect(productsService.getProductById).toHaveBeenCalledTimes(1);
      expect(productsService.getProductById).toHaveBeenCalledWith(2);
    });

    it('should return a product with the givin id', async () => {
      const product = await productsController.getProductById(2);
      expect(product.id).toBe(2);
    });

    it('should throw NotFoundException if product was not found', async () => {
      expect.assertions(1);
      try {
        await productsController.getProductById(20);
      } catch (error) {
        expect(error).toMatchObject({ message: 'Product not found' });
      }
    });
  });

  // Update product
  describe('updateProductById()', () => {
    const title = 'product updated';

    it("should call 'updateProductById' method in productsService", async () => {
      await productsController.updateProductById(2, { title });
      expect(productsService.updateProductById).toHaveBeenCalled();
      expect(productsService.updateProductById).toHaveBeenCalledTimes(1);
      expect(productsService.updateProductById).toHaveBeenCalledWith(2, {
        title,
      });
    });

    it('should return the updated product', async () => {
      const result = await productsController.updateProductById(2, { title });
      expect(result.title).toBe(title);
      expect(result.id).toBe(2);
    });
  });

  // Delete product
  describe('deleteProductById()', () => {
    it("should call 'deleteProductById' method in productsService", async () => {
      await productsController.deleteProductById(2);
      expect(productsService.deleteProductById).toHaveBeenCalled();
      expect(productsService.deleteProductById).toHaveBeenCalledTimes(1);
    });
  });
});
