import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { productsProvider } from './schema/products.provider';
import { Products } from './schema/product.schema';
import { DatabaseModule } from '../common/database/database.module';

@Module({
  imports: [DatabaseModule, SequelizeModule.forFeature([Products])],
  providers: [ProductsService, ...productsProvider],
  exports: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {
  constructor() {
    console.log({ ...productsProvider });
  }
}
