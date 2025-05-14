import { Tool } from '../tool.interface';

export class ClassifyTextTool implements Tool {
  name = 'classify_text';
  description = 'Простая классификация текста по ключевым словам и меткам';

  async run(input: { text: string; labels: Record<string, string[]> }): Promise<string> {
    const { text, labels } = input;

    if (!text || typeof text !== 'string' || !labels || typeof labels !== 'object') {
      return '❌ Укажи текст и список меток с ключевыми словами';
    }

    const lowerText = text.toLowerCase();
    const matched: string[] = [];

    for (const label of Object.keys(labels)) {
      const keywords = labels[label];
      if (keywords.some(word => lowerText.includes(word.toLowerCase()))) {
        matched.push(label);
      }
    }

    return matched.length > 0
      ? `🏷️ Найдены категории: ${matched.join(', ')}`
      : '🔍 Категории не найдены';
  }
}