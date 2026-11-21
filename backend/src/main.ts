import 'reflect-metadata';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    instrument: ObserveInstrument,
  });

  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')));

  app.enableCors({
    origin: config.getOrThrow<string>('FRONT_URL'),
    credentials: true,
  });

  if (config.get('NODE_ENV') === 'production') {
    app.set('trust proxy', 1);
  }

  await app.listen(config.getOrThrow<number>('PORT'));
  console.log(
    `🚀 API rodando em http://localhost:${config.getOrThrow<number>('PORT')}`,
  );
}

void bootstrap();
