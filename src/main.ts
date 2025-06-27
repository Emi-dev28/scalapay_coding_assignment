import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { envs } from './config/app.envs';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { setupApp } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApp(app);
  const doc = parse(readFileSync('openapi.yaml', 'utf-8')) as OpenAPIObject;
  SwaggerModule.setup('api', app, doc);

  await app.listen(envs.serverHttpPort);
}

bootstrap();
