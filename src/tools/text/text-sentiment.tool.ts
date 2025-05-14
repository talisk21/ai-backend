import { Tool } from '../tool.interface';

export class TextSentimentTool implements Tool {
  name = 'text_sentiment';
  description = 'Простой анализ тональности текста (позитив, негатив, нейтрально)';

  private positiveWords = ['отлично', 'хорошо', 'супер', 'круто', 'счастлив', 'нравится', 'прекрасно'];
  private negativeWords = ['плохо', 'ужасно', 'ненавижу', 'грусть', 'разочарован', 'нравится', 'печально'];

  async run(input: { text: string }): Promise<string> {
    const text = input.text.toLowerCase();

    const positives = this.positiveWords.filter(w => text.includes(w)).length;
    const negatives = this.negativeWords.filter(w => text.includes(w)).length;

    if (positives > negatives) return '😊 Позитивный текст';
    if (negatives > positives) return '☹️ Негативный текст';
    return '😐 Нейтральный текст';
  }
}