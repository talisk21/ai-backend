import { Tool } from '../tool.interface';

export class JsonValidateTool implements Tool {
  name = 'json_validate';
  description = 'Проверяет, является ли строка валидным JSON';

  async run(input: { text: string }): Promise<string> {
    try {
      JSON.parse(input.text);
      return '✅ Строка — корректный JSON';
    } catch (err: any) {
      return `❌ Ошибка: ${err.message}`;
    }
  }
}