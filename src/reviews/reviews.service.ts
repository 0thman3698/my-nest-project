import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { JWTPayloadType } from '../utils/types';
import { UpdateReviewDto } from './dtos/UpdateReviewDto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}
  async createReview(
    productId: number,
    userId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const product = await this.productsService.getProductById(productId);
    const user = await this.usersService.getCurrentUser(userId);
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      product,
      user,
    });
    const result = await this.reviewsRepository.save(review);
    return {
      id: result.id,
      comment: result.comment,
      rating: result.rating,
      createdAt: result.createdAt,
      userId: user.id,
      productId: product.id,
    };
  }

  /**
   * Get all reviews
   * @param pageNumber number of the current page
   * @param reviewPerPage data per page
   * @returns collection of reviews
   */
  public async getAll(pageNumber: number, reviewPerPage: number) {
    return this.reviewsRepository.find({
      skip: reviewPerPage * (pageNumber - 1),
      take: reviewPerPage,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update reviews
   * @param reviewId id of the review
   * @param userId id of the owner of the review
   * @param dto data for updating the review
   * @returns updated review
   */
  public async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.getReviewBy(reviewId);
    if (review.user.id !== userId)
      throw new ForbiddenException('access denied, you are not allowed');

    review.rating = dto.rating ?? review.rating;
    review.comment = dto.comment ?? review.comment;

    return this.reviewsRepository.save(review);
  }

  /**
   * Delete review
   * @param reviewId id of the review
   * @param payload JWTPayload
   * @returns nothing
   */
  public async delete(reviewId: number, payload: JWTPayloadType) {
    const review = await this.getReviewBy(reviewId);

    if (review.user.id === payload.id || payload.userType === 'admin') {
      await this.reviewsRepository.remove(review);
      return;
    }

    throw new ForbiddenException('you are not allowed');
  }

  /**
   * Get single review by id
   * @param id id of the review
   * @returns review from the database
   */
  private async getReviewBy(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
    });
    if (!review) throw new NotFoundException('review not found');
    console.log(review);

    return review;
  }
}
