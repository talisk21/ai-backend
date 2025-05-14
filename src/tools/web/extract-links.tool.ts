import { Tool } from '../tool.interface';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class ExtractLinksTool implements Tool {
  name = 'extract_links';
  description = 'Извлекает все гиперссылки со страницы (теги <a href="...">).';

  async run(input: { url: string }): Promise<string> {
    const { url } = input;

    if (!url || typeof url !== 'string') {
      return '❌ Укажи валидный URL для извлечения ссылок';
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Agent/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const links = new Set<string>();

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('javascript:')) {
          links.add(href.trim());
        }
      });

      const result = Array.from(links).slice(0, 30); // ограничим до 30 ссылок
      return result.length ? result.join('\n') : '🔍 Ссылки не найдены.';
    } catch (error: any) {
      return `❌ Ошибка при загрузке страницы: ${error.message}`;
    }
  }
}