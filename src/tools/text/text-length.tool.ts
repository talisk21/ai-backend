import { Tool } from '../tool.interface';

export class TextLengthTool implements Tool {
  name = 'text_length';
  description = 'Подсчитывает количество символов и слов в тексте.';

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Текст не задан или имеет неверный формат';
    }

    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).length;

    return `📝 Длина текста: ${charCount} символов, ${wordCount} слов`;
  }
}