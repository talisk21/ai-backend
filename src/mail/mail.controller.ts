import { Body, Controller, Post } from '@nestjs/common';
import { MailAccount } from '@prisma/client';
import * as Services from '@services';

@Controller('mail')
export class MailController {
  constructor(private readonly mail: Services.MailService) {}

  @Post('send')
  send(@Body() dto: any) {
    return this.mail.sendMail(dto.accountId, dto);
  }

  @Post('fetch')
  fetch(@Body('accountId') id: string) {
    return this.mail.fetchMail(id);
  }

  @Post('account')
  createAccount(
    @Body() body: Omit<MailAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.mail.createAccount(body);
  }
}
