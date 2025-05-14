import { Tool } from '../tool.interface';

export class JsonExtractTool implements Tool {
  name = 'json_extract';
  description = 'Извлекает значение из JSON по ключу или пути (например: user.name)';

  async run(input: { json: object; path: string }): Promise<string> {
    const { json, path } = input;

    if (!json || typeof path !== 'string') {
      return '❌ Неверный ввод';
    }

    const keys = path.split('.');
    let result: any = json;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return `❌ Ключ '${key}' не найден`;
      }
    }

    return `📤 Значение: ${JSON.stringify(result)}`;
  }
}