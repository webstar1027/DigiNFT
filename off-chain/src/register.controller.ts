import { Body, Controller, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './services/email.service';

@Controller()
export class RegisterController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Post('/register')
  updProfile(@Param('id') id: string, @Body() body) {
    const request = body.formData;
    const subject = 'Creator registration request';
    // console.log('request:', request);
    if (request === {}) {
      return 'error';
    }

     const message = `
    <p>You have received a request from ${request.username} to become a verified seller. Their email is ${request.email}</p>
    <ul>
      <li>Username: ${request.username}</li>
      <li>Email: ${request.email}</li>
      <li>Twitter: ${request.twitter}</li>
      <li>Instagram: ${request.instagram}</li>cyber
      <li>Twitch: ${request.twitch}</li>
      <li>TikTok: ${request.tiktok}</li>
      <li>Description: ${request.description}</li>
      <li>I have a physical secure location - You will have custodial responsibilities to store items in secure, confidential, environmentally controlled location(s) for physical collectibles.: ${request.digisafe_1}</li>
      <li>I have/ can get insurance - Digisafe inventory must be insured. You will be asked later to provide copy of binder and all riders: ${request.digisafe_2}</li>
      <li>I have researched all the required certificates and licenses required by law if any for the jurisdictions I plan to operate in as a collectibles storage/processing facility: ${request.digisafe_3}</li>
      <li>I guarantee I will be able to process shipping/processing requests within 48 hours from the time of request: ${request.digisafe_4}</li>
      <li>I guarantee that I will visually authenticate all items to be processed by my facility + verify authentication by scanning barcode. I will do my utmost best to help ensure that fraudulent / fake items do not get added to the platform: ${request.digisafe_5}</li>
      <li>I understand checking these boxes does not mean I will be guaranteed an opportunity to participate as a Digisafe Operator: ${request.digisafe_6}</li>
      <li>I will provide my location for my proposed Digisafe location (city, state/region, country) in the other text box below: ${request.digisafe_7}</li>
    </ul>
    <p>Other: ${request.other}</p>
    <p>Apply to become a Digisafe Operator: ${request.operator}</p>`;

    this.emailService.sendRegisterEMail(
      process.env.EMAIL_FROM,
      subject,
      message.toString(),
    );
    const result = request[id];
    result['status'] = 'success';
    result['updated'] = 'updated';
    return { request: request, success: 'true' };
  }
}
