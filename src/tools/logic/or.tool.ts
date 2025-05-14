import { Tool } from '../tool.interface';

export class OrTool implements Tool {
  name = 'or';
  description = 'Выполняет логическое ИЛИ (OR) между двумя значениями.';

  async run(input: { a: boolean; b: boolean }): Promise<string> {
    return input.a || input.b ? 'true' : 'false';
  }
}