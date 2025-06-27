export enum ProductValidationErrors {
  NAME_NOT_EXISTS = 'Name should exist',
  NAME_IS_CHARACTER = 'Name should be a chain of characters',
  NAME_MIN_LENGTH = 'Name must be longer than or equal to 2 characters',
  NAME_MAX_LENGHT = 'Name must not be longer than 100 characters',
  PRODUCT_TOKEN_IS_ALPHANUMERIC = 'Product Token should be composed only of alphanumerical characters',
  PRODUCT_TOKEN_NOT_EMPTY = 'Product token should exist',
  PRICE_NOT_EMPTY = 'Price should exist',
  PRICE_IS_POSITIVE = 'Price should be a positive number with up to 2 decimal places',
  PRICE_IS_NUMBER = 'Price should be a number with up to 2 decimal places',
  STOCK_NOT_EMPTY = 'Stock should exist',
  STOCK_IS_POSITIVE = 'Stock should be a positive number',
  PRODUCT_ID = 'ProductId should exist',
}

export enum ErrorMessages {
  VALIDATION_FAILED = 'Validation failed',
  RESOURCE_ALREADY_EXISTS = 'Resource already exists',
  DATABASE_CONNECTION_FAILED = 'Database connection failed',
  AN_ERROR_OCCURRED = 'An error occurred',
  INTERNAL_SERVER_ERROR = 'Internal server error',
}

export enum PaginationValidationErrors {
  LIMIT_IS_INTEGER = 'Limit must be an integer value.',
  LIMIT_MIN_VALUE = 'Limit must be at least 1.',

  OFFSET_IS_INTEGER = 'Offset must be an integer value.',
  OFFSET_MIN_VALUE = 'Offset cannot be negative.',

  PAGE_IS_INTEGER = 'Page must be an integer value.',
  PAGE_MIN_VALUE = 'Page must be at least 1.',
}
