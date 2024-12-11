import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS based on environment
  if (process.env.NODE_ENV === 'development') {
    app.enableCors(); // Allow all origins in development
  } else {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 4000);
  console.log(`Server is running on port ${process.env.PORT ?? 4000}`);
}
bootstrap();
