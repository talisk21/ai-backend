import { Tool } from '../tool.interface';
import axios from 'axios';

export class UrlTitleTool implements Tool {
  name = 'url_title';
  description = 'Получает <title> веб-страницы по указанному URL.';

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== 'string') {
      return '❌ URL не указан';
    }

    try {
      const response = await axios.get(url);
      const html = response.data as string;

      const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (match && match[1]) {
        return `📌 Заголовок страницы: ${match[1].trim()}`;
      }

      return 'ℹ️ Заголовок <title> не найден';
    } catch (error: any) {
      return `❌ Ошибка при загрузке: ${error?.message || 'неизвестная ошибка'}`;
    }
  }
}