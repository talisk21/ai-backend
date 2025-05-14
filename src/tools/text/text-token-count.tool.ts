import { Tool } from '../tool.interface';

export class TextTokenCountTool implements Tool {
  name = 'text_token_count';
  description = 'Подсчитывает примерное количество токенов в тексте';

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Пожалуйста, укажи текст';
    }

    // Эвристика: 1 токен ≈ 0.75 слова (например, "Привет, мир!" → 3 слова → ~4 токена)
    const words = text.trim().split(/\s+/).length;
    const approxTokens = Math.ceil(words * 1.33);

    return `🧮 Примерное количество токенов: ${approxTokens}`;
  }
}