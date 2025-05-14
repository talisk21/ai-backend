import { Tool } from '../tool.interface';
import axios from 'axios';

export class TranslateTextTool implements Tool {
  name = 'translate_text';
  description = 'Переводит текст с одного языка на другой через LibreTranslate API';

  async run(input: { text: string; from?: string; to: string }): Promise<string> {
    const { text, from = 'auto', to } = input;

    if (!text || !to) {
      return '❌ Укажи текст и целевой язык (например, "en", "ru")';
    }

    try {
      const res = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: from,
        target: to,
        format: 'text',
      }, {
        headers: { accept: 'application/json' },
      });

      return `🔁 Перевод: ${res.data.translatedText}`;
    } catch (error: any) {
      return `❌ Ошибка перевода: ${error.message}`;
    }
  }
}