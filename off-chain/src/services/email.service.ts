import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private nodemailer = require('nodemailer');

  public async sendMail(
    to: string,
    subject: string,
    body: string,
  ): Promise<boolean> {
    const trans = await this.nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      secure: process.env.EMAIL_SECURE,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: body,
    };
    return new Promise((resolve) => {
      trans.sendMail(mailOptions, (err, info) => {
        if (err) {
          resolve(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  public async sendRegisterEMail(
    from: string,
    subject: string,
    request: string,
  ): Promise<boolean> {
    console.log(
      'Sending email to',
      process.env.EMAIL_RECEIVER,
      'with subject:',
      subject,
      'and body:',
      request,
    );

    const trans = await this.nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      secure: process.env.EMAIL_SECURE,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: from,
      to: process.env.EMAIL_RECEIVER,
      subject,
      html: request,
    };
    return new Promise((resolve) => {
      trans.sendMail(mailOptions, (err, info) => {
        if (err) {
          resolve(err);
          console.log(err);
        } else {
          console.log('success');
          resolve(true);
        }
      });
    });
  }
}
