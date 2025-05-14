import { Tool } from '../tool.interface';

export class NotifyEmailTool implements Tool {
  name = 'notify_email';
  description = 'Эмулирует отправку email-сообщения.';

  async run(input: { to: string; subject: string; message: string }): Promise<string> {
    const { to, subject, message } = input;

    if (!to || !subject || !message) {
      return '❌ Отсутствует адрес, тема или сообщение.';
    }

    // Здесь будет подключение к почтовому сервису в будущем
    return `📧 Письмо отправлено на ${to}\nТема: ${subject}\nСообщение: ${message}`;
  }
}