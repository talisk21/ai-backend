import { Tool } from '../tool.interface';

export class TextRepeatTool implements Tool {
  name = 'text_repeat';
  description = 'Повторяет текст указанное количество раз с разделителем.';

  async run(input: { text: string; times: number; separator?: string }): Promise<string> {
    const { text, times, separator = ' ' } = input;

    if (!text || typeof text !== 'string' || !Number.isInteger(times) || times < 1) {
      return '❌ Укажи текст и целое число повторений ≥ 1';
    }

    return Array(times).fill(text).join(separator);
  }
}