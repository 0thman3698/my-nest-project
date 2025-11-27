import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ApiBody, ApiConsumes, ApiSecurity } from '@nestjs/swagger';
import { ImageUploadDto } from './dtos/image-upload.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  //POST: ~/api/users/auth/register
  @Post('auth/register')
  register(@Body() registerDto: RegisterDto) {
    return this.userService.register(registerDto);
  }
  //POST: ~/api/users/auth/login
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  // GET: ~/api/users/current-user
  @Get('current-user')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    console.log('get current user route handler called');
    return this.userService.getCurrentUser(payload.id);
  }

  // GET: ~/api/users
  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRolesGuard)
  @ApiSecurity('bearer')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // PUT: ~/api/users
  @Put()
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiSecurity('bearer')
  updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(payload.id, updateUserDto);
  }
  // DELETE: ~/api/users/:id
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRolesGuard)
  @ApiSecurity('bearer')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.userService.deleteUser(id, payload);
  }
  // POST: ~/api/users/upload-image
  @Post('upload-image')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: ImageUploadDto,
    description: 'Upload user profile image',
  })
  @UseInterceptors(FileInterceptor('user-image'))
  updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    if (!file) {
      throw new BadRequestException();
    }
    return this.userService.setProfileImage(payload.id, file.filename);
  }

  //DELETE: ~/api/users/images/remove-profile-image
  @Delete('images/remove-profile-image')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  removeProfileImage(@CurrentUser() payload: JWTPayloadType) {
    return this.userService.removeProfileImage(payload.id);
  }

  //GET: ~/api/users/images/:image
  @Get('images/:image')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  showProfileImage(
    @Param('image') image: string,
    @CurrentUser() payload: JWTPayloadType,
    @Res() res: Response,
  ) {
    return res.sendFile(image, { root: 'images/users' });
  }

  //GET: ~/api/users/verify-email/:id/:verificationToken
  @Get('verify-email/:id/:verificationToken')
  verifyEmail(
    @Param('id', ParseIntPipe) id: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.userService.verifyEmail(id, verificationToken);
  }

  // POST: ~/api/users/forgot-password
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  public forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.userService.sendResetPassword(body.email);
  }

  // GET: ~/api/users/reset-password/:id/:resetPasswordToken
  @Get('reset-password/:id/:resetPasswordToken')
  public getResetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
    return this.userService.getResetPassword(id, resetPasswordToken);
  }

  // POST: ~/api/users/reset-password
  @Post('reset-password')
  public resetPassword(@Body() body: ResetPasswordDto) {
    return this.userService.resetPassword(body);
  }
}
