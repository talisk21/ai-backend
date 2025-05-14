import { Tool } from '../tool.interface';
import axios from 'axios';

export class NotifyWebhookTool implements Tool {
  name = 'notify_webhook';
  description = 'Отправляет HTTP-запрос на указанный Webhook (универсальный метод).';

  async run(input: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
  }): Promise<string> {
    const { url, method = 'POST', headers = {}, params = {}, data } = input;

    if (!url) return '❌ Не указан URL для webhook-запроса';

    try {
      const response = await axios.request({
        url,
        method,
        headers,
        params,
        data,
      });

      return `✅ Webhook выполнен: [${response.status}] ${response.statusText}`;
    } catch (error: any) {
      const code = error.response?.status;
      const msg = error.response?.statusText || error.message;
      return `❌ Ошибка webhook: ${code || '—'} ${msg}`;
    }
  }
}