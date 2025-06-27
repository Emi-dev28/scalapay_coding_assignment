import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ProductValidationErrors } from 'src/modules/common/utils/validation-messages';

export class UpdateProductDto {
  @IsNotEmpty({ message: ProductValidationErrors.STOCK_NOT_EMPTY })
  @IsNumber()
  @Min(0, { message: ProductValidationErrors.STOCK_IS_POSITIVE })
  stock: number;

  @IsNotEmpty({ message: ProductValidationErrors.PRODUCT_ID })
  @IsNumber()
  @IsPositive()
  productId: number;
}
