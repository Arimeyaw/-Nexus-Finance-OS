import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(cookieParser());
  app.use(
    (rateLimit as unknown as { default: Function }).default({
      windowMs: 1000 * 60,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nexus Finance OS API')
    .setDescription('REST API for Nexus Finance OS')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
  console.log('Backend listening on http://localhost:4000');
}

bootstrap();
