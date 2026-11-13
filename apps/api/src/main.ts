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

  // Strict, explicitly approved production and development origins
  const approvedProductionOrigins = new Set([
    'https://www.waimunicipalcouncil.org',
    'https://waimunicipalcouncil.org',
    'https://admin.waimunicipalcouncil.org',
    'https://employee.waimunicipalcouncil.org',
    'https://api.waimunicipalcouncil.org',
    'https://130.210.21.72',
    'http://130.210.21.72',
  ]);

  const developmentOrigins = [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ];

  const envCustomOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (approvedProductionOrigins.has(origin)) {
        return callback(null, true);
      }

      if (envCustomOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!isProduction && developmentOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked unauthorized origin: ${origin}`);
      return callback(new Error('Blocked by CORS policy: Origin not allowed'), false);
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
