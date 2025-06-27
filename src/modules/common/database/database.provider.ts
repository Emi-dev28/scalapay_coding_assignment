import { Sequelize } from 'sequelize-typescript';
import { envs } from 'src/config/app.envs';
import { Products } from 'src/modules/products/schema/product.schema';
import { DB_PROVIDER } from 'src/modules/common/utils/constants';

export const databaseProviders = [
  {
    provide: DB_PROVIDER,
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: envs.dbHost,
        port: envs.dbPort,
        username: envs.dbUsername,
        password: envs.dbPassword,
        database: envs.dbName,
      });
      sequelize.addModels([Products]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
