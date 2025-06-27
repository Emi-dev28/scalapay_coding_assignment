import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import * as request from 'supertest';
import { ProductsModule } from 'src/modules/products/products.module';
import { Products } from 'src/modules/products/schema/product.schema';
import { CreateProductDto } from 'src/modules/products/controllers/dto/create-product.dto';
import { UpdateProductDto } from 'src/modules/products/controllers/dto/update-product.dto';
import {
  ErrorMessages,
  PaginationValidationErrors,
  ProductValidationErrors,
} from 'src/modules/common/utils/validation-messages';
import { App } from 'supertest/types';
import { setupApp } from 'src/config/app.config';

describe('Products API - Integration Tests', () => {
  let app: INestApplication<App>;
  const randAlphanumeric = () => Math.random().toString(36).slice(2, 12);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          autoLoadModels: true,
          models: [Products],
          synchronize: true,
          logging: false,
        }),
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    setupApp(app);

    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    const sequelize = app.get(getConnectionToken());
    const models = sequelize.models;

    for (const modelName of Object.keys(models)) {
      await models[modelName].destroy({
        where: {},
        truncate: true,
        force: true,
      });
    }

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /products - when creating a product', () => {
    it('should create a product and return 201 when all required fields are provided', async () => {
      const product: CreateProductDto = {
        name: 'Test Product',
        price: 10.99,
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(product)
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: product.name,
          price: product.price,
          productToken: product.productToken,
          stock: product.stock,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
      expect(response.body.id).toBeGreaterThan(0);
    });

    it('should return 400 when product name is missing', async () => {
      const invalidProduct = {
        price: 10.99,
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual({
        error: expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.NAME_NOT_EXISTS),
        ]),
        timestamp: expect.any(String),
        path: '/products',
      });
    });

    it('should return 400 when product name is empty string', async () => {
      const invalidProduct = {
        name: '',
        price: 10.99,
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        error: expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.NAME_NOT_EXISTS),
        ]),
        timestamp: expect.any(String),
        path: '/products',
      });
    });

    it('should return 400 when product name is too short', async () => {
      const invalidProduct = {
        name: 'A',
        price: 10.99,
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.NAME_MIN_LENGTH),
        ]),
      );
    });

    it('should return 400 when productToken is missing', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 10.99,
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            ProductValidationErrors.PRODUCT_TOKEN_NOT_EMPTY,
          ),
        ]),
      );
    });

    it('should return 400 when productToken contains non-alphanumeric characters', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 10.99,
        productToken: `${randAlphanumeric()}@@`,
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            ProductValidationErrors.PRODUCT_TOKEN_IS_ALPHANUMERIC,
          ),
        ]),
      );
    });

    it('should return 400 when price is missing', async () => {
      const invalidProduct = {
        name: 'Test Product',
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.PRICE_NOT_EMPTY),
        ]),
      );
    });

    it('should return 400 when price is negative', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: -10.99,
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.PRICE_IS_POSITIVE),
        ]),
      );
    });

    it('should return 400 when price is not a number', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 'not-a-number',
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.PRICE_IS_NUMBER),
        ]),
      );
    });

    it('should return 400 when price has more than 2 decimal places', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 10.999,
        productToken: randAlphanumeric(),
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.PRICE_IS_NUMBER),
        ]),
      );
    });

    it('should return 400 when stock is missing', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 10.99,
        productToken: randAlphanumeric(),
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.STOCK_NOT_EMPTY),
        ]),
      );
    });

    it('should return 400 when stock is negative', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 10.99,
        productToken: randAlphanumeric(),
        stock: -5,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.STOCK_IS_POSITIVE),
        ]),
      );
    });

    it('should return 400 when stock is not a number', async () => {
      const invalidProduct = {
        name: 'Test Product',
        price: 10.99,
        productToken: randAlphanumeric(),
        stock: 'not-a-number',
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(invalidProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.STOCK_IS_POSITIVE),
        ]),
      );
    });

    it('should return 400 when productToken already exists', async () => {
      const productToken = randAlphanumeric();
      const product: CreateProductDto = {
        name: 'First Product',
        price: 10.99,
        productToken: productToken,
        stock: 10,
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(product)
        .expect(HttpStatus.CREATED);

      const duplicateProduct = {
        name: 'Second Product',
        price: 15.99,
        productToken: productToken,
        stock: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(duplicateProduct)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual({
        message: ErrorMessages.VALIDATION_FAILED,
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'productToken',
            message: expect.any(String),
          }),
        ]),
        timestamp: expect.any(String),
      });
    });

    it('should return created product with generated ID and timestamp', async () => {
      const product: CreateProductDto = {
        name: 'Timestamped Product',
        price: 25.5,
        productToken: randAlphanumeric(),
        stock: 100,
      };

      const beforeCreate = new Date();
      const response = await request(app.getHttpServer())
        .post('/products')
        .send(product)
        .expect(HttpStatus.CREATED);

      const afterCreate = new Date();

      expect(response.body.id).toBeGreaterThan(0);
      expect(new Date(response.body.createdAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);

      const createdAt = new Date(response.body.createdAt);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('GET /products - when reading products', () => {
    it('should return 200 with empty array when no products exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({
        data: [],
        pageNumber: expect.any(Number),
        pageSize: expect.any(Number),
        pageCount: expect.any(Number),
        itemsCount: expect.any(Number),
      });
    });
    it('should return 200 with all products when they exist', async () => {
      const productToken1 = randAlphanumeric();
      const productToken2 = randAlphanumeric();

      const products = [
        {
          name: 'Product 1',
          price: 10.99,
          productToken: productToken1,
          stock: 10,
        },
        {
          name: 'Product 2',
          price: 15.99,
          productToken: productToken2,
          stock: 20,
        },
      ];
      for (const product of products) {
        await request(app.getHttpServer())
          .post('/products')
          .send(product)
          .expect(HttpStatus.CREATED);
      }
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(HttpStatus.OK);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.itemsCount).toBe(2);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          name: 'Product 1',
          productToken: productToken1,
        }),
      );
    });
    it('should return paginated results when page and limit are provided', async () => {
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: `Product ${i}`,
            price: 10.99,
            productToken: `${randAlphanumeric()}${i}`,
            stock: 10,
          })
          .expect(HttpStatus.CREATED);
      }
      const response = await request(app.getHttpServer())
        .get('/products?page=2&limit=2')
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveLength(2);
      expect(response.body).toMatchObject({
        itemsCount: 5,
        pageNumber: 2,
        pageSize: 2,
        pageCount: 3,
      });
    });
    it('should return first page and 10 items when no query params are provided', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 10.99,
          productToken: randAlphanumeric(),
          stock: 10,
        })
        .expect(HttpStatus.CREATED);
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(HttpStatus.OK);
      expect(response.body.pageNumber).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.pageCount).toBe(1);
    });

    it('should return 400 when page parameter is negative', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?page=-1')
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({
        error: expect.arrayContaining([
          expect.stringContaining(PaginationValidationErrors.PAGE_MIN_VALUE),
        ]),
        timestamp: expect.any(String),
        path: '/products?page=-1',
      });
    });
    it('should return 400 when limit parameter is negative', async () => {
      const response = await request(app.getHttpServer())
        .get('/products?limit=-5')
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({
        error: expect.arrayContaining([
          expect.stringContaining(PaginationValidationErrors.LIMIT_MIN_VALUE),
        ]),
        timestamp: expect.any(String),
        path: '/products?limit=-5',
      });
    });
    it('should include pagination metadata in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(HttpStatus.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('itemsCount');
      expect(response.body).toHaveProperty('pageNumber');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('pageCount');
    });
  });

  describe('PATCH /products/stock - when updating product stock', () => {
    let createdProduct: any;
    beforeEach(async () => {
      const product: CreateProductDto = {
        name: 'Product for Update',
        price: 20.0,
        productToken: randAlphanumeric(),
        stock: 100,
      };
      const response = await request(app.getHttpServer())
        .post('/products')
        .send(product)
        .expect(HttpStatus.CREATED);
      createdProduct = response.body;
    });

    it('should update stock and return 200 when product exists and new stock is valid', async () => {
      const updateDto: UpdateProductDto = {
        productId: createdProduct.id,
        stock: 50,
      };

      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({ success: expect.any(Boolean) }),
      );
    });

    it('should return 404 when product does not exist', async () => {
      const updateDto: UpdateProductDto = {
        productId: 99999,
        stock: 50,
      };
      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual({
        error: expect.stringContaining(
          `Product with ID ${updateDto.productId} not found`,
        ),
        timestamp: expect.any(String),
        path: '/products/stock',
      });
    });
    it('should return 400 when productId is missing from request body', async () => {
      const invalidUpdate = {
        stock: 50,
      };
      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(invalidUpdate)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.PRODUCT_ID),
        ]),
      );
    });
    it('should return 400 when new stock is missing from request body', async () => {
      const invalidUpdate = {
        productId: createdProduct.id,
      };
      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(invalidUpdate)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.STOCK_NOT_EMPTY),
        ]),
      );
    });
    it('should return 400 when new stock is negative', async () => {
      const invalidUpdate = {
        productId: createdProduct.id,
        stock: -10,
      };
      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(invalidUpdate)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.STOCK_IS_POSITIVE),
        ]),
      );
    });
    it('should return 400 when new stock is not a number', async () => {
      const invalidUpdate = {
        productId: createdProduct.id,
        stock: 'not-a-number',
      };
      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(invalidUpdate)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.error).toEqual(
        expect.arrayContaining([
          expect.stringContaining(ProductValidationErrors.STOCK_IS_POSITIVE),
        ]),
      );
    });

    it('should allow updating stock to zero', async () => {
      const updateDto: UpdateProductDto = {
        productId: createdProduct.id,
        stock: 0,
      };
      const response = await request(app.getHttpServer())
        .patch('/products/stock')
        .send(updateDto)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: expect.any(Boolean),
        }),
      );
    });
  });

  describe('DELETE /products/:id - when deleting a product', () => {
    let createdProduct: any;
    beforeEach(async () => {
      const product: CreateProductDto = {
        name: 'Product for Delete',
        price: 15.0,
        productToken: randAlphanumeric(),
        stock: 30,
      };
      const response = await request(app.getHttpServer())
        .post('/products')
        .send(product)
        .expect(HttpStatus.CREATED);
      createdProduct = response.body;
    });

    it('should delete product and return 200 when product exists', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/products/${createdProduct.id}`)
        .expect(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });
    it('should return 400 when product ID is invalid format', async () => {
      const response = await request(app.getHttpServer())
        .delete('/products/invalid-id')
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        error: expect.stringContaining('Validation failed'),
        timestamp: expect.any(String),
        path: '/products/invalid-id',
      });
    });
    it('should return 404 when product does not exist', async () => {
      const DELETED_ID = 99999;
      const response = await request(app.getHttpServer())
        .delete('/products/99999')
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        error: expect.stringContaining(
          `Product with ID ${DELETED_ID} not found`,
        ),
        timestamp: expect.any(String),
        path: '/products/99999',
      });
    });

    it('should return 404 when trying to access deleted product', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${createdProduct.id}`)
        .expect(HttpStatus.OK);
      await request(app.getHttpServer())
        .delete(`/products/${createdProduct.id}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
