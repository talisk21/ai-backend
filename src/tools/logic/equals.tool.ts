import { Tool } from '../tool.interface';

export class EqualsTool implements Tool {
  name = 'equals';
  description = 'Сравнивает два значения на равенство (===).';

  async run(input: { a: any; b: any }): Promise<string> {
    const { a, b } = input;

    return a === b ? 'true' : 'false';
  }
}