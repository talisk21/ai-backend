import { Tool } from '../tool.interface';
import { franc } from 'franc';

export class DetectLanguageTool implements Tool {
  name = 'detect_language';
  description = 'Определяет язык переданного текста. Возвращает ISO-код (например: ru, en, fr).';

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Укажи текст';
    }

    const lang = franc(text);
    if (lang === 'und') return '⚠️ Язык не определён';

    return `🌐 Язык текста: ${lang}`;
  }
}