# My Nest Project

A comprehensive NestJS API for managing products, users, reviews, and file uploads with email notifications.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)

---

## ✨ Features

### Users Module

- ✅ User registration with email verification
- ✅ JWT-based authentication (login/logout)
- ✅ Password reset via email
- ✅ User profile management
- ✅ Profile image upload support
- ✅ Role-based access control (ADMIN, NORMAL_USER)

### Products Module

- ✅ Full CRUD operations for products
- ✅ Admin-only product creation
- ✅ Advanced filtering (by title, price range)
- ✅ Product-user relationships

### Reviews Module

- ✅ Create/Read/Update/Delete reviews
- ✅ Pagination support
- ✅ Rating system (1-5 stars)
- ✅ Review-product-user relationships

### Uploads Module

- ✅ Single file upload
- ✅ Multiple files upload
- ✅ Image retrieval endpoint
- ✅ Multer integration

### Mail Module

- ✅ Email verification on registration
- ✅ Password reset emails
- ✅ Login notification emails
- ✅ EJS template rendering

---

## 🛠️ Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Framework**      | NestJS 11.0.1                                   |
| **Language**       | TypeScript 5.7.3                                |
| **Database**       | PostgreSQL + TypeORM 0.3.27                     |
| **Authentication** | JWT @nestjs/jwt 11.0.1                          |
| **Validation**     | class-validator 0.14.2, class-transformer 0.5.1 |
| **Email**          | @nestjs-modules/mailer 2.0.2, Nodemailer 7.0.10 |
| **File Upload**    | Multer via @nestjs/platform-express             |
| **Documentation**  | Swagger/OpenAPI @nestjs/swagger 11.2.3          |
| **Testing**        | Jest 30.0.0, Supertest 7.0.0                    |
| **Linting**        | ESLint 9.18.0, Prettier 3.4.2                   |

---

## 📦 Prerequisites

- **Node.js**: v18+ or v20+
- **npm**: v9+
- **PostgreSQL**: v12+
- **Git**: For version control

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/0thman3698/my-nest-project.git
cd my-nest-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment files

Create `.env.development` file in the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nest_db

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@example.com

# App
DOMAIN=http://localhost:5000
CLIENT_DOMAIN=http://localhost:3000
PORT=5000
NODE_ENV=development
```

Create `.env.test` file for testing:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nest_test_db

JWT_SECRET=test_secret
JWT_EXPIRATION=1h

DOMAIN=http://localhost:5000
CLIENT_DOMAIN=http://localhost:3000
PORT=5000
NODE_ENV=test
```

---

## ⚙️ Environment Setup

### Database Setup

1. **Create PostgreSQL databases:**

```sql
CREATE DATABASE nest_db;
CREATE DATABASE nest_test_db;
```

2. **Run migrations (if any):**

```bash
npm run typeorm migration:run
```

### Gmail Setup (for Email Service)

1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `MAIL_PASSWORD` env variable

---

## 🎯 Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Production Build

```bash
npm run build
```

The API will be available at: `http://localhost:5000`

Swagger documentation: `http://localhost:5000/api/docs`

---

## 🧪 Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run E2E tests

```bash
npm run test:e2e
```

### Check test coverage

```bash
npm run test:cov
```

---

## 📁 Project Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Entry point
├── products/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   ├── product.entity.ts
│   ├── products.service.spec.ts
│   └── dtos/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── user.entity.ts
│   ├── auth.provider.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── user-role.decorator.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── auth-roles.guard.ts
│   └── dtos/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       ├── forgot-password.dto.ts
│       ├── reset-password.dto.ts
│       ├── update-user.dto.ts
│       └── image-upload.dto.ts
├── reviews/
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   ├── reviews.module.ts
│   ├── review.entity.ts
│   └── dtos/
│       ├── create-review.dto.ts
│       └── UpdateReviewDto.ts
├── uploads/
│   ├── uploads.controller.ts
│   ├── uploads.module.ts
│   └── dtos/
│       └── files-upload.dto.ts
├── mail/
│   ├── mail.service.ts
│   ├── mail.module.ts
│   └── templates/
│       ├── verify-email.ejs
│       ├── reset-password.ejs
│       └── login.ejs
└── utils/
    ├── constants.ts
    ├── enums.ts
    ├── types.ts
    ├── interceptors/
    │   └── logger.interceptor.ts
    └── middlewares/
        └── logger.middleware.ts
```

---

## 🔌 API Endpoints

### Authentication (Users)

| Method | Endpoint                               | Description                     |
| ------ | -------------------------------------- | ------------------------------- |
| POST   | `/api/users/register`                  | Register new user               |
| POST   | `/api/users/login`                     | Login user                      |
| POST   | `/api/users/forgot-password`           | Request password reset          |
| POST   | `/api/users/reset-password/:id/:token` | Reset password                  |
| GET    | `/api/users/verify-email/:id/:token`   | Verify email                    |
| GET    | `/api/users/profile`                   | Get user profile (protected)    |
| PATCH  | `/api/users/profile`                   | Update user profile (protected) |

### Products

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/api/products`     | Get all products (with filters) |
| GET    | `/api/products/:id` | Get product by ID               |
| POST   | `/api/products`     | Create product (Admin only)     |
| PATCH  | `/api/products/:id` | Update product (Admin only)     |
| DELETE | `/api/products/:id` | Delete product (Admin only)     |

### Reviews

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| GET    | `/api/reviews`     | Get all reviews (paginated) |
| GET    | `/api/reviews/:id` | Get review by ID            |
| POST   | `/api/reviews`     | Create review (protected)   |
| PATCH  | `/api/reviews/:id` | Update review (protected)   |
| DELETE | `/api/reviews/:id` | Delete review (protected)   |

### Uploads

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | `/api/uploads/single`    | Upload single file    |
| POST   | `/api/uploads/multiple`  | Upload multiple files |
| GET    | `/api/uploads/:filename` | Download file         |

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### How to authenticate:

1. **Register a user:**

```bash
POST /api/users/register
Body: {
  "email": "user@example.com",
  "password": "Password123!",
  "username": "johndoe"
}
```

2. **Verify email** (click link sent to email)

3. **Login:**

```bash
POST /api/users/login
Body: {
  "email": "user@example.com",
  "password": "Password123!"
}
Response: {
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

4. **Use token in requests:**

```bash
Headers: {
  "Authorization": "Bearer <accessToken>"
}
```

---

## 🧠 Role-Based Access Control

- **ADMIN**: Can create/update/delete products
- **NORMAL_USER**: Can view products, create reviews

---

## 🐛 Troubleshooting

### Database connection error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

- Ensure PostgreSQL is running
- Check DB credentials in `.env.development`

### Email not sending

- Verify Gmail App Password is correct
- Enable "Less secure app access" if using regular Gmail password
- Check firewall/network settings

### Port already in use

```bash
# Change PORT in .env.development
PORT=5001
```

---

## 📝 Notes

- Make sure to exclude `.env` files from git (already in `.gitignore`)
- Run `npm run lint` to check code style
- Run `npm run format` to auto-format code
- Tests use a separate database to avoid data corruption

---

## 👤 Author

- **GitHub**: [@0thman3698](https://github.com/0thman3698)

---

## 📄 License

This project is open source and available under the MIT License.
$ npm run test

# e2e tests

$ npm run test:e2e

# test coverage

$ npm run test:cov

````

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
````

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
