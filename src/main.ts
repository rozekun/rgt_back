import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config(); // .env 로드

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // true로 설정하면, DTO에 정의되지 않은 속성이 요청에 포함되면 자동으로 제거합니다.
      forbidNonWhitelisted: true, // true로 설정하면, DTO에 정의되지 않은 속성이 요청에 포함되면 400 에러를 반환합니다.
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // 정적 파일 제공 (e.g. localhost:3000/uploads/books/...)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
    setHeaders: (res, path) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년 캐싱
    },
  });
  // CORS 설정 (환경변수 기반)
  app.enableCors({
    origin: process.env.FRONT_CORS_URL || 'http://localhost:3000',
    credentials: true,
  });


  await app.listen(3001); // 포트 번호를 3001로 변경
}

bootstrap();
