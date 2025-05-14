import { Tool } from '../tool.interface';
import { removeStopwords } from 'stopword';

export class ExtractKeywordsTool implements Tool {
  name = 'extract_keywords';
  description = 'Извлекает ключевые слова из текста, исключая стоп-слова';

  async run(input: { text: string; top?: number }): Promise<string> {
    const { text, top = 10 } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Укажи текст';
    }

    const words = text
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const filtered = removeStopwords(words);

    const freq: Record<string, number> = {};
    for (const word of filtered) {
      freq[word] = (freq[word] || 0) + 1;
    }

    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([word]) => word);

    return `🔑 Ключевые слова: ${keywords.join(', ')}`;
  }
}