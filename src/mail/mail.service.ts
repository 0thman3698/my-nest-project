import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendLogInEmail(email: string) {
    try {
      const today = new Date();
      await this.mailerService.sendMail({
        to: email,
        from: `<noreply@my-nestjs-app.com>`,
        subject: 'Log in',
        template: 'login',
        context: { email, today },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
  async sendVerifyEmailTemplate(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<noreply@my-nestjs-app.com>`,
        subject: 'Verify your account ',
        template: 'verify-email',
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
  async sendResetPasswordTemplate(email: string, resetPasswordLink: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<noreply@my-nestjs-app.com>`,
        subject: 'Reset  password',
        template: 'reset-password',
        context: { resetPasswordLink },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
