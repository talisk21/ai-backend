import { Tool } from '../tool.interface';

export class AndTool implements Tool {
  name = 'and';
  description = 'Выполняет логическое И (AND) между двумя значениями.';

  async run(input: { a: boolean; b: boolean }): Promise<string> {
    return input.a && input.b ? 'true' : 'false';
  }
}