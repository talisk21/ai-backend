import { Tool } from '../tool.interface';
import axios from 'axios';

export class UrlStatusTool implements Tool {
  name = 'url_status';
  description = 'Проверяет HTTP-статус ответа от заданного URL.';

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== 'string') {
      return '❌ URL не указан';
    }

    try {
      const response = await axios.head(url); // HEAD-запрос для экономии трафика
      return `🔍 Статус ${response.status}: ${response.statusText}`;
    } catch (error: any) {
      if (error.response) {
        return `⚠️ Ошибка ${error.response.status}: ${error.response.statusText}`;
      }
      return `❌ Ошибка: ${error.message}`;
    }
  }
}