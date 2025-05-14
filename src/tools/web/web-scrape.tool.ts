import { Tool } from '../tool.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebScrapeTool implements Tool {
  name = 'web_scrape';
  description = 'Загружает HTML-страницу и извлекает читаемый текст.';

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== 'string') {
      return '❌ Укажи валидный URL для парсинга';
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Agent/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);

      // Удалим лишнее
      $('script, style, noscript, iframe, head, meta, link').remove();

      const text = $('body').text();
      const cleaned = text.replace(/\s+/g, ' ').trim();

      return cleaned.slice(0, 2000) || '⛔ Ничего не найдено на странице.';
    } catch (error: any) {
      return `❌ Ошибка при загрузке страницы: ${error.message}`;
    }
  }
}