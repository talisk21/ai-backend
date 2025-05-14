import { Tool } from '../tool.interface';

export class NumberDiffTool implements Tool {
  name = 'number_diff';
  description = 'Вычисляет разницу между двумя числами (a - b). Можно включить abs=true для абсолютного значения.';

  async run(input: { a: number; b: number; abs?: boolean }): Promise<string> {
    const { a, b, abs } = input;

    if (typeof a !== 'number' || typeof b !== 'number') {
      return '❌ Оба значения должны быть числами (a и b)';
    }

    const result = abs ? Math.abs(a - b) : a - b;

    return result.toString();
  }
}