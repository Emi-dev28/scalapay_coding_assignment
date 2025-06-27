import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional } from 'class-validator';
import { PaginationValidationErrors } from 'src/modules/common/utils/validation-messages';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: PaginationValidationErrors.LIMIT_IS_INTEGER })
  @Min(1, { message: PaginationValidationErrors.LIMIT_MIN_VALUE })
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: PaginationValidationErrors.OFFSET_IS_INTEGER })
  @Min(0, { message: PaginationValidationErrors.OFFSET_MIN_VALUE })
  offset: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: PaginationValidationErrors.PAGE_IS_INTEGER })
  @Min(1, { message: PaginationValidationErrors.PAGE_MIN_VALUE })
  page: number = 1;
}
