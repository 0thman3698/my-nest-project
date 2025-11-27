import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  //Apply middlewares
  app.use(helmet());

  // Enable CORS
  app.enableCors({ origin: 'http://localhost:3000' });

  // Swagger setup
  const config = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('My NestJS App API')
    .setDescription('API documentation for My NestJS App')
    .addServer('http://localhost:5000')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentation);

  // Start the server
  const Port = 5000;
  await app.listen(process.env.PORT ?? Port, () =>
    console.log(`server is listening on port: ${Port}`),
  );
}
bootstrap().catch((err) => console.error(err));
