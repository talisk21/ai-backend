import { Tool } from '../tool.interface';

export class JsonKeysTool implements Tool {
  name = 'json_keys';
  description = 'Возвращает список всех ключей верхнего уровня JSON-объекта.';

  async run(input: { json: object }): Promise<string> {
    if (!input.json || typeof input.json !== 'object') {
      return '❌ Неверный JSON';
    }

    const keys = Object.keys(input.json);
    return keys.length
      ? `🔑 Ключи: ${keys.join(', ')}`
      : '📭 Объект пуст';
  }
}