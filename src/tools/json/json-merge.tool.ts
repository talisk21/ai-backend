import { Tool } from '../tool.interface';

export class JsonMergeTool implements Tool {
  name = 'json_merge';
  description = 'Объединяет два JSON-объекта. Второй перезаписывает значения первого.';

  async run(input: { a: object; b: object }): Promise<string> {
    try {
      const merged = { ...input.a, ...input.b };
      return `🧩 Объединённый JSON: ${JSON.stringify(merged, null, 2)}`;
    } catch (e) {
      return '❌ Ошибка при объединении объектов';
    }
  }
}