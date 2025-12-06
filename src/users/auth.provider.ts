import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from '../utils/types';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  /**
   *Create new User
   * @param registerDto data for createing new user
   * @returns JWT(access token)
   */
  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException('user already exist');

    const hashedPassword = await this.hashPassword(password);

    let newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
      verificationToken: randomBytes(32).toString('hex'),
    });

    newUser = await this.userRepository.save(newUser);

    if (!newUser.verificationToken) {
      throw new BadRequestException('Verification token missing');
    }
    const link = this.generateLink(newUser.id, newUser.verificationToken);
    try {
      await this.mailService.sendVerifyEmailTemplate(email, link);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('Email error:', err.message);
      throw new BadRequestException('Error sending verification email');
    }

    return {
      message:
        'Verification token has been sent to your email, please verify your email address',
    };
  }
  /**
   * login user
   * @param loginDto date for login to user account
   * @returns JWT(access token)
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('invalid email or password');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('invalid email or password');

    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString('hex');
        const result = await this.userRepository.save(user);
        verificationToken = result.verificationToken;
      }

      if (!verificationToken) {
        throw new BadRequestException('Verification token missing');
      }
      const link = this.generateLink(user.id, verificationToken);
      await this.mailService.sendVerifyEmailTemplate(email, link);

      return {
        message:
          'Verification token has been sent to your email, please verify your email address',
      };
    }

    const payload: JWTPayloadType = {
      id: user.id,
      userType: user.userType,
    };

    const accessToken = await this.generateJWT(payload);

    return { accessToken };
  }

  async sendResetPasswordLink(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException('user with given email does not exist');
    user.resetPasswordToken = randomBytes(32).toString('hex');
    const result = await this.userRepository.save(user);

    const resetPasswordLink = `${this.configService.get<string>('CLIENT_DOMAIN')}/reset-password/${user.id}/${result.resetPasswordToken}`;

    await this.mailService.sendResetPasswordTemplate(email, resetPasswordLink);

    return {
      message: `Password reset link sent to your email, please check your inbox`,
    };
  }

  public async getResetPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('invalid link');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('invalid link');

    return { message: 'valid link' };
  }

  public async resetPassword(dto: ResetPasswordDto) {
    const { userId, resetPasswordToken, newPassword } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('invalid link');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('invalid link');

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    await this.userRepository.save(user);

    return { message: 'password reset successfully, please log in' };
  }

  /**
   * hashing password
   * @param password plain text password
   * @returns hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  /**
   * Generate Json web token
   * @param payload JWT payload
   * @returns token
   */

  private generateJWT(payload: JWTPayloadType) {
    return this.jwtService.signAsync(payload);
  }

  private generateLink(userId: number, verificationToken: string) {
    return `${this.configService.get<string>('DOMAIN')}/api/users/verify-email/${userId}/${verificationToken}`;
  }
}
