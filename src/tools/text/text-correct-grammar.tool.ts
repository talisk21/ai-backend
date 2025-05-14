import { Tool } from '../tool.interface';

export class TextCorrectGrammarTool implements Tool {
  name = 'text_correct_grammar';
  description = 'Исправляет орфографию и пунктуацию в коротком тексте (basic level)';

  async run(input: { text: string }): Promise<string> {
    let { text } = input;

    if (!text || typeof text !== 'string') {
      return '❌ Пожалуйста, укажи текст';
    }

    // Простые улучшения:
    text = text
      .replace(/\s+/g, ' ') // удалить лишние пробелы
      .replace(/ ,/g, ',')  // убрать пробел перед запятой
      .replace(/ \./g, '.') // убрать пробел перед точкой
      .replace(/\s+([!?])/g, '$1') // убрать пробел перед воскл./вопр.
      .replace(/(^\w)|(\.\s+\w)/g, m => m.toUpperCase()); // первая буква с заглавной

    return `✍️ Исправленный текст:\n${text}`;
  }
}