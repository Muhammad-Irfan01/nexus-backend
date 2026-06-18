import { Module } from '@nestjs/common';

import { MailerModule }
from '@nestjs-modules/mailer';

import { join } from 'path';

import { MailService }
from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

@Module({
 imports: [
  MailerModule.forRoot({
   transport: {
    host: process.env.MAIL_HOST,

    port: Number(
      process.env.MAIL_PORT,
    ),

    secure: false,

    auth: {
     user:
      process.env.MAIL_USER,

     pass:
      process.env.MAIL_PASSWORD,
    },
   },

   defaults: {
    from:
      process.env.MAIL_FROM,
   },

   template: {
    dir: join(
      process.cwd(),
      'src/modules/mail/templates',
    ),

    adapter:
      new HandlebarsAdapter(),

    options: {
     strict: true,
    },
   },
  }),
 ],

 providers: [MailService],

 exports: [MailService],
})
export class MailModule {}