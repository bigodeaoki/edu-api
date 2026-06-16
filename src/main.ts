import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const cfg = app.get(ConfigService);

  const origins = (cfg.get<string>('CORS_ORIGIN') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // CORS_ORIGIN vazio ou contendo "*" libera qualquer origem.
  // (com a origem refletida, continua compatível com credentials: true)
  const allowAllOrigins = origins.length === 0 || origins.includes('*');

  app.enableCors({
    origin: allowAllOrigins ? true : origins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(cfg.get<string>('PORT') ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`edu-api on http://localhost:${port}`);
}
void bootstrap();
