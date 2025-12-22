import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { Address } from "@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface";

@Injectable()
export class MailService{
  constructor(
    private readonly mailerService : MailerService,
  ){}

  async sendMail(
    receivers : string | Address | Array<string | Address>,
    subject : string,
    text? : string,
    template? : string,
    context? : Record<string, any>
  ){
    return await this.mailerService.sendMail({
      // to : receivers,
      to : 'chunbin002@gmail.com',
      from : "Trung Bin",
      subject,
      text, 
      template,
      context
    })
    .catch(err => {
      throw err
    })
  }
}