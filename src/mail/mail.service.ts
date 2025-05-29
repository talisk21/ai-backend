import { Injectable } from '@nestjs/common';
import { MailAccount } from '@prisma/client';
import * as Services from '@services';
import * as imap from 'imap-simple';
import { ParsedMail, simpleParser } from 'mailparser';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly prisma: Services.PrismaService) {}

  async createAccount(
    data: Omit<MailAccount, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MailAccount> {
    return this.prisma.mailAccount.create({ data });
  }

  async getAccount(id: string): Promise<MailAccount> {
    return this.prisma.mailAccount.findUnique({ where: { id } });
  }

  async sendMail(
    accountId: string,
    options: { to: string; subject: string; html?: string; text?: string },
  ) {
    const account = await this.getAccount(accountId);
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpPort === 465,
      auth: {
        user: account.smtpUser,
        pass: account.smtpPass,
      },
    });

    await transporter.sendMail({
      from: account.email,
      ...options,
    });

    return '📤 Письмо отправлено';
  }

  async fetchMail(accountId: string): Promise<ParsedMail[]> {
    const account = await this.getAccount(accountId);

    const connection = await imap.connect({
      imap: {
        user: account.imapUser,
        password: account.imapPass,
        host: account.imapHost,
        port: account.imapPort,
        tls: true,
        authTimeout: 10000,
      },
    });

    await connection.openBox('INBOX');

    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: false,
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const parsed: ParsedMail[] = [];

    for (const item of messages) {
      const all = item.parts.find((p) => p.which === 'TEXT');
      if (!all) continue;

      const parsedMail = await simpleParser(all.body);
      parsed.push(parsedMail);
    }

    await connection.end();
    return parsed;
  }
}
