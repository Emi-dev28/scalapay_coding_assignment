import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { UpdateProductDto } from '../controllers/dto/update-product.dto';
import { ProductAttributes, Products } from '../schema/product.schema';
import { PRODUCTS_REPOSITORY } from 'src/modules/common/utils/constants';
import { ProductNotFoundException } from '../errors/product-id-not-found.error';
import { ValidationError, ValidationErrorItem } from 'sequelize';

describe('Products Module - Unit Tests', () => {
  let service: ProductsService;
  let productRepositoryMock: typeof Products;

  const mockProductRepository = {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockProductInstance: ProductAttributes & {
    createdAt: Date;
    updatedAt: Date;
  } = {
    id: 1,
    name: 'Premium Wireless Headphones Mock',
    productToken: 'PWH20MOCK',
    price: 299.99,
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct: Omit<ProductAttributes, 'id'> = {
    name: 'Premium Wireless Headphones Mock',
    productToken: 'PWH20MOCK',
    price: 299.99,
    stock: 50,
  };

  const mockNewProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    stock: 10,
    productToken: 'abc102',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockDaoInstance: Partial<ProductAttributes> = {};

  const validationErrorItem: ValidationErrorItem[] = [
    new ValidationErrorItem(
      'productToken must be unique',
      'unique violation',
      'productToken',
      mockProduct.productToken,
      mockDaoInstance as any,
      'unique violation',
      'unique',
      {} as any,
    ),
  ];
  const mockUpdateProductDto: UpdateProductDto = {
    stock: 20,
    productId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PRODUCTS_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();
    productRepositoryMock = module.get(PRODUCTS_REPOSITORY);
    service = module.get<ProductsService>(ProductsService);
  });

  describe('when creating a product', () => {
    let createRepositorySpy;
    let createServiceSpy;
    beforeEach(() => {
      createRepositorySpy = jest.spyOn(productRepositoryMock, 'create');
      createServiceSpy = jest.spyOn(service, 'create');
    });
    it('should create a product when all required fields are valid', async () => {
      mockProductRepository.create.mockResolvedValue(mockProductInstance);

      const createdProduct = await service.create(mockProduct);

      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const expectedResponse = expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(Number),
        stock: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const validInput = expect.objectContaining({
        name: expect.any(String),
        productToken: expect.any(String),
        price: expect.any(Number),
        stock: expect.any(Number),
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productRepositoryMock.create).toHaveBeenCalledWith(
        mockProduct, // Your product data
        { raw: true },
      );

      expect(mockProduct).toMatchObject(validInput);
      expect(createServiceSpy).toHaveBeenCalledWith(mockProduct);

      expect(createRepositorySpy).toHaveBeenCalledTimes(1);
      expect(createServiceSpy).toHaveBeenCalledTimes(1);

      expect(createdProduct).toEqual(expectedResponse);
    });

    it('should reject creation when productToken already exists', async () => {
      mockProductRepository.create.mockRejectedValue(
        new ValidationError('Validation error', validationErrorItem),
      );

      await expect(service.create(mockProduct)).rejects.toBeInstanceOf(
        ValidationError,
      );
    });
  });

  describe('when reading products', () => {
    let serviceFindAllSpy;
    let repositoryFindAllSpy;
    beforeEach(() => {
      serviceFindAllSpy = jest.spyOn(service, 'findAll');
      repositoryFindAllSpy = jest.spyOn(
        productRepositoryMock,
        'findAndCountAll',
      );
    });

    it('should return paginated products with metadata', async () => {
      mockProductRepository.findAndCountAll.mockResolvedValue({
        rows: [mockNewProduct],
        count: 1,
      });

      const LIMIT = 10;
      const OFFSET = 0;
      const PAGE = 1;
      const paginatedResult = await service.findAll(LIMIT, OFFSET, PAGE);

      expect(serviceFindAllSpy).toHaveBeenCalledWith(LIMIT, OFFSET, PAGE);
      expect(repositoryFindAllSpy).toHaveBeenCalledWith({
        limit: LIMIT,
        offset: OFFSET,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      });
      expect(repositoryFindAllSpy).toHaveBeenCalledTimes(1);
      expect(paginatedResult).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            price: expect.any(Number),
            stock: expect.any(Number),
          }),
        ]),
        pageNumber: expect.any(Number),
        pageSize: expect.any(Number),
        pageCount: expect.any(Number),
        itemsCount: expect.any(Number),
      });
    });
  });

  describe('when updating product stock', () => {
    let serviceUpdateSpy;
    let repositoryUpdateSpy;
    beforeEach(() => {
      serviceUpdateSpy = jest.spyOn(service, 'update');
      repositoryUpdateSpy = jest.spyOn(productRepositoryMock, 'update');
    });

    it('should update stock when product exists and new stock is valid', async () => {
      mockProductRepository.update.mockResolvedValue([1]);

      const update = await service.update(mockUpdateProductDto);

      expect(mockUpdateProductDto).toMatchObject({
        stock: expect.any(Number),
        productId: expect.any(Number),
      });
      expect(repositoryUpdateSpy).toHaveBeenCalledWith(
        { stock: mockUpdateProductDto.stock },
        {
          where: {
            id: mockUpdateProductDto.productId,
          },
        },
      );
      expect(serviceUpdateSpy).toHaveBeenCalledTimes(1);
      expect(update).toEqual(
        expect.objectContaining({
          success: expect.any(Boolean),
        }),
      );
    });

    it('should throw ProductIdNotFoundException when no rows are affected', async () => {
      mockProductRepository.update.mockResolvedValue([0]);

      await expect(service.update(mockUpdateProductDto)).rejects.toThrow(
        new ProductNotFoundException(mockUpdateProductDto.productId),
      );
      expect(serviceUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when deleting a product', () => {
    let serviceDeleteSpy;
    let repositoryDeleteSpy;
    beforeEach(() => {
      serviceDeleteSpy = jest.spyOn(service, 'delete');
      repositoryDeleteSpy = jest.spyOn(productRepositoryMock, 'destroy');
    });

    it('should delete product when it exists', async () => {
      mockProductRepository.destroy.mockResolvedValue(1);
      const ID = 2;
      const result = await service.delete(ID);

      expect(serviceDeleteSpy).toHaveBeenCalledWith(ID);
      expect(repositoryDeleteSpy).toHaveBeenCalledWith({
        where: { id: ID },
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: expect.any(Boolean),
        }),
      );
    });

    it('should throw ProductIdNotFoundException when no rows are affected', async () => {
      mockProductRepository.destroy.mockResolvedValue(0);

      const ID = 1;

      await expect(service.delete(ID)).rejects.toThrow(
        new ProductNotFoundException(ID),
      );
    });
  });
});
