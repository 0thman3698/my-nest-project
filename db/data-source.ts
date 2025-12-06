import { User } from '../src/users/user.entity';
import { Product } from '../src/products/product.entity';
import { Review } from '../src/reviews/review.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Product, Review],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
