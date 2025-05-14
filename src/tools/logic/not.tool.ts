import { Tool } from '../tool.interface';

export class NotTool implements Tool {
  name = 'not';
  description = 'Инвертирует логическое значение.';

  async run(input: { value: boolean }): Promise<string> {
    return input.value ? 'false' : 'true';
  }
}