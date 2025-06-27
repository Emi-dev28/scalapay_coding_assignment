import { PRODUCTS_REPOSITORY } from 'src/modules/common/utils/constants';
import { Products } from './product.schema';

export const productsProvider = [
  {
    provide: PRODUCTS_REPOSITORY,
    useValue: Products,
  },
];
