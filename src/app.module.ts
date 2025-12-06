import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { LoggerMiddleware } from './utils/middlewares/logger.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { dataSourceOptions } from '../db/data-source';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV}`
          : '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 4000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 7,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 15,
      },
    ]),
    MailModule,
    ProductsModule,
    UsersModule,
    ReviewsModule,
    UploadsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

// ///LOCAL DB
// {
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         database: configService.get('DB_DATABASE'),
//         username: configService.get('DB_USERNAME'),
//         password: configService.get<string>('DB_PASSWORD'),
//         port: configService.get('DB_PORT'),
//         host: configService.get('DB_HOST'),
//         synchronize: process.env.NODE_ENV !== 'production',
//         entities: [Product, User, Review],
//       }),
//       inject: [ConfigService],
//     }
