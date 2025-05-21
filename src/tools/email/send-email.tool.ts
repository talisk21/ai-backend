import { Tool, ToolInputSpecField } from "../tool.interface";
import { MailService } from "../../mail/mail.service";

export class SendEmailTool implements Tool {
  constructor(private mailService: MailService) {
  }

  name = "send_email";
  description = "Отправляет email через заданную учётную запись";

  inputSpec: ToolInputSpecField[] = [
    { name: "accountId", type: "string", required: true, description: "ID почтовой учётной записи" },
    { name: "to", type: "string", required: true, description: "Кому отправить письмо" },
    { name: "subject", type: "string", required: true, description: "Тема письма" },
    { name: "text", type: "string", required: false, description: "Текст письма (обычный текст)" },
    { name: "html", type: "string", required: false, description: "HTML-содержимое письма" }
  ];

  async run(input: any): Promise<string> {
    await this.mailService.sendMail(input.accountId, {
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html
    });
    return "✅ Письмо отправлено";
  }
}