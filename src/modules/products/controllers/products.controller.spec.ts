import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { ProductNotFoundException } from '../errors/product-id-not-found.error';
import { PaginationQueryDto } from './dto/pagination-dto';
import { plainToInstance } from 'class-transformer';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 1,
    name: 'Product 1',
    productToken: 'ABC123',
    price: 10.5,
    stock: 100,
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    let controllerCreate;
    let serviceCreate;
    beforeEach(() => {
      controllerCreate = jest.spyOn(controller, 'create');
      serviceCreate = jest.spyOn(service, 'create');
    });
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'Premium Wireless Headphones',
        productToken: 'PWH2024',
        price: 299.99,
        stock: 50,
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(controllerCreate).toHaveBeenCalledWith(createProductDto);
      expect(serviceCreate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when service fails', async () => {
      const createProductDto = {
        name: 'Premium Wireless Headphones',
        productToken: 'PWH2024',
        price: 299.99,
        stock: 50,
      };

      const error = new Error('Database connection failed');
      mockProductsService.create.mockRejectedValue(error);

      await expect(controller.create(createProductDto)).rejects.toThrow(error);
      expect(serviceCreate).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    const query = { page: 1, limit: 10, offset: 0 };
    let serviceFindAll;

    beforeEach(() => {
      serviceFindAll = jest.spyOn(service, 'findAll');
    });
    it('should return paginated products', async () => {
      const expectedResult = {
        data: [mockProduct],
        pageNumber: 1,
        pageSize: 10,
        pageCount: 1,
        itemsCount: 1,
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getAll(query);

      expect(serviceFindAll).toHaveBeenCalledWith(
        query.limit,
        query.offset,
        query.page,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty results', async () => {
      const expectedResult = {
        data: [],
        pageNumber: 1,
        pageSize: 10,
        pageCount: 0,
        itemsCount: 0,
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getAll(query);

      expect(result).toEqual(expectedResult);
    });

    it('should use default pagination when query params are not provided', async () => {
      const query = plainToInstance(PaginationQueryDto, {});
      const expectedResult = {
        data: [],
        pageNumber: 1,
        pageSize: 10,
        pageCount: 0,
        itemsCount: 0,
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getAll(query);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateStock', () => {
    let serviceUpdate;
    beforeEach(() => {
      serviceUpdate = jest.spyOn(service, 'update');
    });
    it('should update product stock successfully', async () => {
      const updateStockDto = { stock: 50, productId: 1 };
      const updatedProduct = { ...mockProduct, stock: 50 };

      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.updateStock(updateStockDto);

      expect(serviceUpdate).toHaveBeenCalledWith(updateStockDto);
      expect(result).toEqual(updatedProduct);
    });

    it('should throw ProductNotFoundException when product not found', async () => {
      const updateStockDto = { stock: 50, productId: 999 };
      const error = new ProductNotFoundException(999);

      mockProductsService.update.mockRejectedValue(error);

      await expect(controller.updateStock(updateStockDto)).rejects.toThrow(
        ProductNotFoundException,
      );
      expect(serviceUpdate).toHaveBeenCalledWith(updateStockDto);
    });
  });

  describe('delete', () => {
    let serviceDelete;
    beforeEach(() => {
      serviceDelete = jest.spyOn(service, 'delete');
    });
    it('should delete product successfully', async () => {
      const productId = 1;
      const deleteResult = { deleted: true };

      mockProductsService.delete.mockResolvedValue(deleteResult);

      const result = await controller.delete(productId);

      expect(serviceDelete).toHaveBeenCalledWith(productId);
      expect(result).toEqual(deleteResult);
    });

    it('should throw ProductNotFoundException when product not found', async () => {
      const productId = 999;
      const error = new ProductNotFoundException(productId);

      mockProductsService.delete.mockRejectedValue(error);

      await expect(controller.delete(productId)).rejects.toThrow(
        ProductNotFoundException,
      );
      expect(serviceDelete).toHaveBeenCalledWith(productId);
    });
  });
});
