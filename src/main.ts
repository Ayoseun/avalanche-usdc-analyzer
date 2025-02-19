import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Avalanche USDC API')
    .setDescription('API for tracking USDC transfers on Avalanche C-Chain')
    .setVersion('1.0')
    .addTag('avalanche')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = app.get(ConfigService).envConfig.PORT;
  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
