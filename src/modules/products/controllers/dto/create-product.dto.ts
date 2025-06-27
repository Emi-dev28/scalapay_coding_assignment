import { Transform } from 'class-transformer';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProductValidationErrors } from 'src/modules/common/utils/validation-messages';

export class CreateProductDto {
  @IsNotEmpty({ message: ProductValidationErrors.NAME_NOT_EXISTS })
  @IsString({ message: ProductValidationErrors.NAME_IS_CHARACTER })
  @MinLength(2, { message: ProductValidationErrors.NAME_MIN_LENGTH })
  @MaxLength(100, { message: ProductValidationErrors.NAME_MAX_LENGHT })
  name: string;

  @IsNotEmpty({ message: ProductValidationErrors.PRODUCT_TOKEN_NOT_EMPTY })
  @IsString()
  @IsAlphanumeric(undefined, {
    message: ProductValidationErrors.PRODUCT_TOKEN_IS_ALPHANUMERIC,
  })
  productToken: string;

  @IsNotEmpty({ message: ProductValidationErrors.PRICE_NOT_EMPTY })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: ProductValidationErrors.PRICE_IS_NUMBER },
  )
  @IsPositive({ message: ProductValidationErrors.PRICE_IS_POSITIVE })
  price: number;

  @IsNotEmpty({ message: ProductValidationErrors.STOCK_NOT_EMPTY })
  @IsPositive({ message: ProductValidationErrors.STOCK_IS_POSITIVE })
  stock: number;
}
