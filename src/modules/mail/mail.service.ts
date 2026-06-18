import {
 Injectable,
 InternalServerErrorException,
} from '@nestjs/common';

import { MailerService }
from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
 constructor(
  private readonly mailerService:
    MailerService,
 ) {}

 async sendVerificationEmail(
  email: string,
  token: string,
 ) {
  try {
   const url =
`${process.env.FRONTEND_URL}/verify-email?token=${token}`;

   await this.mailerService.sendMail({
    to: email,

    subject:
      'Verify Your Email',

    template:
      'verification',

    context: {
     verificationUrl: url,
    },
   });
  } catch (error) {
   throw new InternalServerErrorException(
    'Failed to send verification email',
   );
  }
 }

 async sendResetPasswordEmail(
  email: string,
  token: string,
 ) {
  try {
   const url =
`${process.env.FRONTEND_URL}/reset-password?token=${token}`;

   await this.mailerService.sendMail({
    to: email,

    subject:
      'Reset Your Password',

    template:
      'reset-password',

    context: {
     resetUrl: url,
    },
   });
  } catch (error) {
   throw new InternalServerErrorException(
    'Failed to send reset email',
   );
  }
 }
}