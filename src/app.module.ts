import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsModule } from './modules/products/products.module';
import { Products } from './modules/products/schema/product.schema';
import { envs } from './config/app.envs';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: envs.dbHost,
      port: envs.dbPort,
      username: envs.dbUsername,
      password: envs.dbPassword,
      database: envs.dbName,
      models: [Products],
      autoLoadModels: true,
      synchronize: false,
    }),
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
