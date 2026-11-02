import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Cookie parsing for HttpOnly JWT
  app.use(cookieParser());

  // Input validation & sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global API route prefix
  app.setGlobalPrefix('api');

  // Strict CORS setup
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://www.waimunicipalcouncil.org',
    'https://waimunicipalcouncil.org',
    'https://admin.waimunicipalcouncil.org',
    'https://employee.waimunicipalcouncil.org',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/([a-zA-Z0-9-]+\.)?waimunicipalcouncil\.org$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Portal-Type',
      'x-portal-type',
      'Accept',
      'Origin',
    ],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Wai Municipal Council NestJS API running on: http://localhost:${port}/api`);
}

process.on('uncaughtException', (err) => {
  console.error('Unhandled process exception captured:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection captured at:', promise, 'reason:', reason);
});

bootstrap();
