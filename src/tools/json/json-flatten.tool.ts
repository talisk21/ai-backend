import { Tool } from '../tool.interface';

export class JsonFlattenTool implements Tool {
  name = 'json_flatten';
  description = 'Преобразует вложенный JSON в плоский объект с точечной нотацией ключей';

  async run(input: { data: any }): Promise<any> {
    const result: any = {};

    function flatten(obj: any, prefix = '') {
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          flatten(value, newKey);
        } else {
          result[newKey] = value;
        }
      }
    }

    flatten(input.data);
    return result;
  }
}