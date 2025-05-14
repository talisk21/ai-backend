import { Tool } from '../tool.interface';

export class TextUppercaseTool implements Tool {
  name = 'text_uppercase';
  description = 'Преобразует текст в ВЕРХНИЙ РЕГИСТР.';

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Текст не задан или имеет неверный формат';
    }

    return `🔠 ${text.toUpperCase()}`;
  }
}