import { Tool } from '../tool.interface';

export class TextSummaryTool implements Tool {
  name = 'text_summary';
  description = 'Создает краткое резюме (summary) из длинного текста.';

  async run(input: { text: string }): Promise<string> {
    const { text } = input;

    if (!text || text.length < 50) {
      return '❌ Недостаточно текста для резюмирования';
    }

    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join(' ');

    return `📝 Резюме: ${summary}`;
  }
}