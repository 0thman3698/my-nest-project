import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from '../utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthProvider } from './auth.provider';
import { join } from 'path';
import { unlinkSync } from 'fs';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) {}
  /**
   *Create new User
   * @param registerDto data for createing new user
   * @returns JWT(access token)
   */
  async register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }
  /**
   * login user
   * @param loginDto date for login to user account
   * @returns JWT(access token)
   */
  async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
  }

  /**
   * Get current user (logged in user)
   * @param id id of the logged in user
   * @returns the user from the database
   */
  async getCurrentUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }
  /**
   * Get all users from database
   * @returns collection of users
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
  /**
   * update user
   * @param id id of the logged user
   * @param updateUserDto data for updating the user
   * @returns updated user from the database
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { password, username } = updateUserDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();

    user.username = username ?? user.username;
    if (password) {
      user.password = await this.authProvider.hashPassword(password);
    }
    return this.userRepository.save(user);
  }
  /**
   * Delete user
   * @param id id of the user
   * @param payload JWT payload
   * @returns no return
   */
  async deleteUser(id: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(id);
    if (user.id === payload?.id || payload.userType === 'admin') {
      await this.userRepository.remove(user);
      return;
    }
    throw new ForbiddenException('access denied, you are not allowed');
  }
  /**
   *
   * @param userId id of the logged user
   * @param newProfileImage profile image
   * @returns the user from database
   */
  async setProfileImage(userId: number, newProfileImage: string) {
    const user = await this.getCurrentUser(userId);
    if (user.profileImage === null) {
      user.profileImage = newProfileImage;
    } else {
      await this.removeProfileImage(userId);
      user.profileImage = newProfileImage;
    }

    return this.userRepository.save(user);
  }

  async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (user.profileImage === null)
      throw new BadRequestException('there is no profile image');

    const imagePath = join(
      process.cwd(),
      `./images/users/${user.profileImage}`,
    );
    unlinkSync(imagePath);
    user.profileImage = null;
    return this.userRepository.save(user);
  }

  async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.getCurrentUser(userId);

    if (user.verificationToken === null)
      throw new NotFoundException('there is no verification token');

    if (user.verificationToken !== verificationToken)
      throw new BadRequestException('Invalid Link');

    user.isAccountVerified = true;
    user.verificationToken = null;
    await this.userRepository.save(user);

    return {
      message: 'your email has been verified, please login to your account',
    };
  }

  sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
  }

  getResetPassword(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.authProvider.resetPassword(dto);
  }
}
