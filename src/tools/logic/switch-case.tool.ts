import { Tool } from '../tool.interface';

export class SwitchCaseTool implements Tool {
  name = 'switch_case';
  description = 'Выбирает значение по ключу (аналог switch/case).';

  async run(input: {
    key: string;
    cases: Record<string, string>;
    default?: string;
  }): Promise<string> {
    const { key, cases, default: defaultValue = 'Неизвестное значение' } = input;

    if (!key || typeof cases !== 'object') {
      return '❌ Неверные параметры';
    }

    return cases[key] ?? defaultValue;
  }
}