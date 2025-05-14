import { Tool } from '../tool.interface';
import axios from 'axios';

export class TextTranslateTool implements Tool {
  name = 'text_translate';
  description = 'Переводит текст с одного языка на другой через LibreTranslate';

  async run(input: { text: string; to: string; from?: string }): Promise<string> {
    const { text, to, from = 'auto' } = input;

    if (!text || !to) {
      return '❌ Укажи текст и целевой язык перевода (например, "en", "ru")';
    }

    try {
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: from,
        target: to,
        format: 'text',
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      return `🌐 Перевод: ${response.data.translatedText}`;
    } catch (error: any) {
      return `❌ Ошибка при переводе: ${error.message}`;
    }
  }
}