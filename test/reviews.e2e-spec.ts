/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Product } from '../src/products/product.entity';
import { User } from '../src/users/user.entity';
import { UserType } from '../src/utils/enums';
import * as bcrypt from 'bcryptjs';
import { CreateReviewDto } from '../src/reviews/dtos/create-review.dto';
import { Review } from '../src/reviews/review.entity';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createReviewDto: CreateReviewDto;
  let accessToken: string;

  beforeEach(async () => {
    createReviewDto = { comment: 'Thanks', rating: 4 };

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);

    // saving a new user (admin) to the database
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          username: 'admin',
          email: 'admin@email.com',
          userType: UserType.ADMIN,
          password: hash,
          isAccountVerified: true,
        },
      ])
      .execute();

    // login to admin account and get the token
    const { body } = await request(app.getHttpServer())
      .post('/api/users/auth/login')
      .send({ email: 'admin@email.com', password: '123456' });
    accessToken = body.accessToken;
  });

  afterEach(async () => {
    await dataSource.createQueryBuilder().delete().from(Review).execute();
    await dataSource.createQueryBuilder().delete().from(Product).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await app.close();
  });

  // POST: ~/api/reviews/:productId
  describe('POST', () => {
    it('should create a new review and save it to the database', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'book', description: 'about this book', price: 10 });

      const response = await request(app.getHttpServer())
        .post(`/api/reviews/${body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createReviewDto);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body).toMatchObject(createReviewDto);
    });
  });

  // GET: ~/api/reviews
  describe('GET', () => {
    it('should return all reviews from the database', async () => {
      const productRes = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'book', description: 'about this book', price: 10 });

      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post(`/api/reviews/${(productRes as any).body.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ comment: `Review ${i}`, rating: i + 1 });
      }

      const response = await request(app.getHttpServer())
        .get('/api/reviews')
        .set('Authorization', `Bearer ${accessToken}`);
      //   console.log('GET /api/reviews response body:', (response as any).body);

      expect(response.status).toBe(200);
      expect((response as any).body.length).toBeGreaterThan(0);
    });
  });

  // PATCH: ~/api/reviews/:id
  describe('PATCH', () => {
    it('should update a review', async () => {
      const productRes = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'book', description: 'about this book', price: 10 });

      const reviewRes = await request(app.getHttpServer())
        .post(`/api/reviews/${(productRes as any).body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createReviewDto);

      const response = await request(app.getHttpServer())
        .put(`/api/reviews/${(reviewRes as any).body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5, comment: 'Updated review' });

      expect(response.status).toBe(200);
      expect((response as any).body.rating).toBe(5);
      expect((response as any).body.comment).toBe('Updated review');
    });

    it('should return 404 if review not found on update', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/reviews/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 5 });

      expect(response.status).toBe(404);
    });

    it('should return 401 if no token provided on update', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/reviews/1')
        .send({ rating: 5 });

      expect(response.status).toBe(401);
    });

    it('should return 400 if rating is invalid', async () => {
      const productRes = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'book', description: 'about this book', price: 10 });

      const reviewRes = await request(app.getHttpServer())
        .post(`/api/reviews/${(productRes as any).body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createReviewDto);

      const response = await request(app.getHttpServer())
        .put(`/api/reviews/${(reviewRes as any).body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ rating: 10 });

      expect(response.status).toBe(400);
    });
  });

  // DELETE: ~/api/reviews/:id
  describe('DELETE', () => {
    it('should delete a review', async () => {
      const productRes = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'book', description: 'about this book', price: 10 });

      const reviewRes = await request(app.getHttpServer())
        .post(`/api/reviews/${(productRes as any).body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createReviewDto);

      const response = await request(app.getHttpServer())
        .delete(`/api/reviews/${(reviewRes as any).body.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 404 if review not found on delete', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/reviews/999')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 if no token provided on delete', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/api/reviews/1',
      );

      expect(response.status).toBe(401);
    });
  });
});
