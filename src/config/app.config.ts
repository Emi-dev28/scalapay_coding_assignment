import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppExceptionFilter } from 'src/modules/common/filter/exception.filter';

export const setupApp = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  return app;
};
