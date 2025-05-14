import { Tool } from '../tool.interface';

export class TextTrimTool implements Tool {
  name = 'text_trim';
  description = 'Удаляет пробелы в начале и в конце строки.';

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Текст не задан или имеет неверный формат';
    }

    return `✂️ "${text.trim()}"`;
  }
}