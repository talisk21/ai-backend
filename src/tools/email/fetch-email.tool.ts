import { Tool, ToolInputSpecField } from "../tool.interface";
import { MailService } from "../../mail/mail.service";

export class FetchEmailTool implements Tool {
  constructor(private mailService: MailService) {
  }

  name = "fetch_email";
  description = "Получает входящие письма для учётной записи";

  inputSpec: ToolInputSpecField[] = [
    { name: "accountId", type: "string", required: true, description: "ID почтовой учётной записи" }
  ];

  async run(input: any): Promise<string> {
    const mails = await this.mailService.fetchMail(input.accountId);
    return mails.length ? JSON.stringify(mails.slice(0, 5), null, 2) : "📭 Нет новых писем";
  }
}