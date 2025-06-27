import { Inject, Injectable } from '@nestjs/common';
import {
  ProductAttributes,
  ProductCreationAttributes,
  Products,
} from '../schema/product.schema';
import { PRODUCTS_REPOSITORY } from 'src/modules/common/utils/constants';
import { UpdateProductDto } from '../controllers/dto/update-product.dto';
import { PagintedResult } from 'src/modules/common/utils/paginated-result.interface';
import { ProductNotFoundException } from '../errors/product-id-not-found.error';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCTS_REPOSITORY)
    private readonly productRepository: typeof Products,
  ) {}

  async create(product: ProductCreationAttributes): Promise<ProductAttributes> {
    return await this.productRepository.create(product, { raw: true });
  }

  async findAll(
    limit: number,
    offset: number,
    page: number,
  ): Promise<PagintedResult<Products[]>> {
    const { rows: items, count: itemsCount } =
      await this.productRepository.findAndCountAll({
        limit: limit,
        offset: offset,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      });

    return {
      data: items,
      pageNumber: page,
      pageSize: limit,
      pageCount: Math.ceil(itemsCount / +limit),
      itemsCount,
    };
  }

  async update({
    stock,
    productId,
  }: UpdateProductDto): Promise<{ success: boolean }> {
    const [updatedRows] = await this.productRepository.update(
      { stock },
      {
        where: {
          id: productId,
        },
      },
    );
    if (updatedRows === 0) {
      throw new ProductNotFoundException(productId);
    }
    return { success: true };
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const affectedRows = await this.productRepository.destroy({
      where: { id },
    });

    if (affectedRows === 0) {
      throw new ProductNotFoundException(id);
    }
    return { success: true };
  }
}
