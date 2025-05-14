import { Tool } from '../tool.interface';

export class NumberCompareTool implements Tool {
  name = 'number_compare';
  description = 'Сравнивает два числа и говорит, какое больше или меньше.';

  async run(input: { a: number; b: number }): Promise<string> {
    const { a, b } = input;

    if (typeof a !== 'number' || typeof b !== 'number') {
      return '❌ Оба значения должны быть числами';
    }

    if (a > b) return `⚖️ ${a} больше, чем ${b}`;
    if (a < b) return `⚖️ ${a} меньше, чем ${b}`;
    return `⚖️ ${a} равно ${b}`;
  }
}